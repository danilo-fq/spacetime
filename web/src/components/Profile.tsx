import { getUser } from '@/lib/auth'
import Image from 'next/image'

export function Profile() {
  const { name, avatarUrl } = getUser()
  return (
    <div className="flex items-center gap-3 px-2 py-1 text-left">
      <Image
        alt="Avatar do usuário"
        width={40}
        height={40}
        src={avatarUrl}
        className="flex h-10 w-10 items-center justify-center rounded-full"
      />

      <p className="max-w-[140px] text-sm leading-snug">
        {name}
        <a href="http://" className="block hover:text-gray-50">
          Sair
        </a>
      </p>
    </div>
  )
}
