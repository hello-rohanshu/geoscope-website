import { Inter as BodyFont, MuseoModerno as DisplayFont } from 'next/font/google'

export const fontBody = BodyFont({
    subsets: ['latin'],
    variable: '--font-body-next',
})

export const fontDisplay = DisplayFont({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-display-next',
})