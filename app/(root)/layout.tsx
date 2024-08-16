<<<<<<< HEAD
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

=======
>>>>>>> ba0cf813dc175264363d4b98d73ce535121ef78f
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
<<<<<<< HEAD
  const loggedIn = {firstName : 'Yosef', lastName:'M.'}
  return (
    <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn}/>
        <div className="flex size-full flex-col">
          <div className="root-layout">
            <Image
            src='/icons/logo.svg'
            alt='logo'
            height={30}
            width={30}/>
            <div>
              <MobileNav user={loggedIn}/>
            </div>
          </div>
          {children}
        </div>
    </main>
        
=======
  return (
    <main>
        SIDEBAR
        {children}
    </main>
>>>>>>> ba0cf813dc175264363d4b98d73ce535121ef78f
  );
}
