'use client'

import { useEffect, useState } from 'react'

/**
 * Tombol tema. Status awal dibaca dari kelas pada <html> yang sudah disetel
 * skrip di layout, sehingga tidak ada kedipan saat halaman dimuat.
 */
export function TombolTema({ ringkas = false }: { ringkas?: boolean }) {
  const [gelap, setGelap] = useState(false)

  useEffect(() => {
    setGelap(document.documentElement.classList.contains('dark'))
  }, [])

  function ubahTema() {
    const jadiGelap = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', jadiGelap)
    try {
      localStorage.setItem('tema', jadiGelap ? 'gelap' : 'terang')
    } catch {
      // Mode penyamaran bisa menolak localStorage; tema tetap berubah untuk sesi ini.
    }
    setGelap(jadiGelap)
  }

  return (
    <button
      type="button"
      onClick={ubahTema}
      aria-label={gelap ? 'Gunakan mode terang' : 'Gunakan mode gelap'}
      className="inline-flex h-10 items-center gap-2 rounded-kontrol border border-border bg-surface px-3 text-sm font-semibold transition hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {gelap ? '☀' : '☾'}
      </span>
      {ringkas ? null : <span>{gelap ? 'Terang' : 'Gelap'}</span>}
    </button>
  )
}
