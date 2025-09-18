import Image from 'next/image'
import React from 'react'

const PDFUploadChatSection = () => {
    return (
        <section className="flex flex-row size-full space-x-6 pt-4">
            <div className="flex flex-col flex-1 justify-center items-center w-full rounded-4xl bg-gray-50 space-y-3">
                <Image src="PDFFileIcon.svg" height={40} width={40} />

                <p>Drop and drop your files here or <span className='font-bold underline cursor-pointer'>Choose file</span></p>
            </div>
            <div className="flex-1 bg-yellow-200"></div>
        </section>
    )
}

export default PDFUploadChatSection