"use client"

import { sendMessageToRAG, uploadFileToRAG } from '@/lib/utils'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

const PDFUploadChatSection = () => {
    const [fileName, setFileName] = useState(null)
    const [isDragging, setIsDragging] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")

    const inputFileRef = useRef(null)
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]

        if (file && file.type === 'application/pdf') {
            setFileName(file.name)
        } else {
            alert('Please drop a valid PDF file.')
        }
    }

    const handleFilePick = (e) => {
        const file = e.target.files[0]

        if (file && file.type === 'application/pdf') {
            setFileName(file.name)
        } else {
            alert('Please select a valid PDF file.')
        }
    }

    const openFileDialog = () => inputFileRef.current.click()

    const uploadFile = async () => {
        const file = inputFileRef.current.files[0]
        if (!file) {
            alert('No file selected for upload.')
            return
        }

        const data = await uploadFileToRAG(file)
        console.log('File uploaded successfully:', data)
    }

    const sendMessage = async () => {
        if (!input.trim()) return

        setMessages(prevMessages => [...prevMessages, { sender: "user", text: input }])

        setInput("")
        
        var answer = await sendMessageToRAG(input)
        setMessages(prevMessages => [...prevMessages, { sender: "assistant", text: answer.answer }])
    }

    const sendMessageOnEnterKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <section className="flex flex-row flex-1 overflow-hidden size-full space-x-6 pt-4">
            <div className={`flex flex-col flex-1 justify-center items-center w-full rounded-4xl space-y-3 transition-colors ${isDragging ? "bg-gray-50" : "bg-left-pane"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <Image src="PDFFileIcon.svg" alt='pdf-icon' height={40} width={40} />

                <p>Drop and drop your files here or <span className='font-bold underline cursor-pointer' onClick={openFileDialog}>Choose file</span></p>

                <input type="file" ref={inputFileRef} className='hidden' accept='application/pdf' onChange={handleFilePick} />

                {fileName && (
                    <div className='flex justify-between items-center space-x-8 mt-4 px-3 p-2 bg-cyan-100 rounded-lg'>
                        <p className='text-sm'><span className='font-medium'>{fileName}</span></p>

                        <button className='bg-yellow-100 px-2 py-1 rounded-lg text-sm cursor-pointer' onClick={uploadFile}>Upload</button>
                    </div>
                )}
            </div>

            <div className="relative flex flex-col flex-1 w-full rounded-4xl px-5 pb-5 bg-right-pane space-y-3 overflow-hidden">
                <div ref={chatEndRef} />

                <div className='flex flex-col-reverse flex-1 size-full space-y-2 space-y-reverse overflow-y-auto [&::-webkit-scrollbar]:hidden'>
                    {messages.slice().reverse().map((msg, index) => (
                        <div key={messages.length - 1 - index} className={`p-2 rounded-t-xl ${msg.sender == "user" ? "self-end bg-white/80 rounded-bl-xl ml-auto" : "self-start bg-orange-100 rounded-br-xl mr-auto"} max-w-xs`}>
                            <p className='text-sm'>{msg.text}</p>
                        </div>
                    ))}
                </div>

                <div className="relative w-full">
                    <input type='text' value={input} placeholder='Ask a question...' className='bg-white border-0 outline-none focus:shadow-md w-full py-2 px-4 rounded-full' onChange={(e) => setInput(e.target.value)} onKeyDown={sendMessageOnEnterKeyDown} />

                    <Image src="search_icon.svg" alt='search-icon' width={30} height={30} className='absolute top-1 right-3 cursor-pointer' onClick={sendMessage} />
                </div>
            </div>
        </section>
    )
}

export default PDFUploadChatSection