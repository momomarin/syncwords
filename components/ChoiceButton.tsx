type State = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed'
interface Props { choice: string; state: State; onClick: () => void; disabled: boolean }

const styles: Record<State, string> = {
  idle:     'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#93C5FD] hover:bg-blue-50',
  selected: 'bg-blue-50 border-[#3B82F6] text-[#1E40AF]',
  correct:  'bg-[#F0FDF4] border-[#22C55E] text-[#15803D]',
  wrong:    'bg-[#FEF2F2] border-[#EF4444] text-[#DC2626]',
  missed:   'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D] opacity-80',
}
const icons: Record<State, string> = { idle:'', selected:'', correct:'✓', wrong:'✗', missed:'→' }

export default function ChoiceButton({ choice, state, onClick, disabled }: Props) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full p-4 rounded-2xl border-2 text-sm font-semibold text-left flex justify-between items-center transition-all duration-150 ${styles[state]} ${disabled && state==='idle' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}>
      <span>{choice}</span>
      {icons[state] && <span className="font-bold text-base">{icons[state]}</span>}
    </button>
  )
}
