export function Mascot({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 240 240" fill="none" role="img" aria-label="SideQuest’s friendly flag-waving mascot">
    <ellipse cx="106" cy="218" rx="70" ry="9" fill="var(--ink)" opacity=".09" />
    <path d="M173 48V163" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
    <path d="M178 48C199 35 216 58 234 43V95C213 110 199 88 178 99Z" fill="var(--periwinkle)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
    <path d="M61 181L52 211C60 217 72 216 81 212L86 189M128 188L137 213C147 218 158 214 164 209L154 179" fill="var(--brand)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
    <path d="M164 132C178 133 185 120 181 112C176 103 168 112 159 114M51 140C29 127 26 151 43 159" fill="var(--brand)" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
    <path d="M42 157C38 125 52 107 55 79C58 41 91 30 117 46C138 58 132 74 152 93C174 114 174 146 163 171C151 199 116 205 84 196C63 190 45 181 42 157Z" fill="var(--brand)" stroke="var(--ink)" strokeWidth="4" />
    <ellipse cx="91" cy="113" rx="7" ry="11" fill="var(--ink)" /><ellipse cx="126" cy="113" rx="7" ry="11" fill="var(--ink)" />
    <path d="M99 138Q111 151 124 136" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
    <path d="M56 64L49 57M40 78L29 77M57 44L54 34" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}