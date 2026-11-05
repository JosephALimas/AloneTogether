import logo from '../../../graphics/Logotipo Alone Together en cursiva.png'

export function BrandLogo({ className }: { className?: string }) {
  return <img className={className} src={logo} alt="Alone Together" />
}
