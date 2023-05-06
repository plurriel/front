import '@/styles/globals.css'
import { DM_Sans } from 'next/font/google'

const DMSans = DM_Sans({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
})

export default function App({ Component, pageProps }) {
  return (
  <>
    <style jsx global>{`
      html {
        font-family: ${DMSans.style.fontFamily};
      }
    `}</style>
    <title>SolidStart - Bare</title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Component {...pageProps} />
  </>
  );
}
