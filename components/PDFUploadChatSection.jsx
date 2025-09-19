"use client"

import Image from 'next/image'
import React, { useRef, useState } from 'react'

const PDFUploadChatSection = () => {
    const [fileName, setFileName] = useState(null)
    const [isDragging, setIsDragging] = useState(null)

    const inputFileRef = useRef(null)

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

    return (
        <section className="flex flex-row size-full space-x-6 pt-4">
            <div className={`flex flex-col flex-1 justify-center items-center w-full rounded-4xl space-y-3 transition-colors ${isDragging ? "bg-gray-50" : "bg-left-pane"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <Image src="PDFFileIcon.svg" alt='pdf-icon' height={40} width={40} />

                <p>Drop and drop your files here or <span className='font-bold underline cursor-pointer' onClick={openFileDialog}>Choose file</span></p>

                <input type="file" ref={inputFileRef} className='hidden' accept='application/pdf' onChange={handleFilePick} />

                {fileName && (
                    <div className='flex justify-between items-center space-x-8 mt-4 px-3 p-2 bg-cyan-100 rounded-lg'>
                        <p className='text-sm'><span className='font-medium'>{fileName}</span></p>

                        <button className='bg-yellow-100 px-2 py-1 rounded-lg text-sm cursor-pointer' onClick={() => { }}>Upload</button>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 justify-center items-center w-full rounded-4xl bg-right-pane space-y-3">

            </div>
        </section>
    )
}

export default PDFUploadChatSection