
import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
    return (
        <header className="">
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" height={24} width={24} />
                    <p>DevEvents</p>
                </Link>

                <ul className="">
                    <Link href="/">Home</Link>
                    <Link href="/">Events</Link>
                    <Link href="/">Create Event</Link>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar