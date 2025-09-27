import Image from 'next/image'
import React from 'react'
import { Pirata_One } from 'next/font/google'

const pirataOne = Pirata_One({ subsets: ['latin'], weight: "400", variable: '--font-pirata-one' })

const Navbar = () => {
    return (
        <nav className='w-full flex justify-center items-center'>
            <h1 className={`text-2xl ${pirataOne.className}`}>Cursed Docs</h1>
        </nav>
    )
}

export default Navbar