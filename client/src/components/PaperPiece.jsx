export default function PaperPiece({ children, color, className = "", rotate = "0deg" }) {
  return (
    <div
      className={`relative p-4 shadow-sm ${className}`}
      style={{
        backgroundColor: color,
        transform: `rotate(${rotate})`,
        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
        border: '2px solid rgba(0,0,0,0.05)',
      }}
    >
      {children}
    </div>
  )
}
