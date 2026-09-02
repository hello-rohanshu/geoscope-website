import { Inter as BodyFont, Space_Grotesk as DisplayFont } from 'next/font/google'

export const fontBody = BodyFont({
    subsets: ['latin'],
    variable: '--font-body-next',
})

export const fontDisplay = DisplayFont({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-display-next',
})