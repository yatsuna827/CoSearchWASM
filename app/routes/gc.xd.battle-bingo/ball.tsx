export const Masterball: React.FC = () => {
  return (
    <svg width={16} height={16} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="3" fill="white" />
      <path d="M5 50 A 45 45 0 0 1 95 50" fill="purple" stroke="black" strokeWidth="3" />
      <text x="50" y="40" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle" alignmentBaseline="middle">
        M
      </text>
    </svg>
  )
}
