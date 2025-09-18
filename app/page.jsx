import Navbar from '@/components/Navbar'
import PDFUploadChatSection from '@/components/PDFUploadChatSection'
import React from 'react'

const Home = () => {
  return (
    <main className='flex flex-col h-screen'>
      <Navbar />

      <PDFUploadChatSection />
    </main>
  )
}

export default Home