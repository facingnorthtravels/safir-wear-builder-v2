'use client'
import { useBuilder } from '@/context/BuilderContext'

const STEPS = [
  { n: 1, label: 'Product' },
  { n: 2, label: 'Fabric' },
  { n: 3, label: 'Colour' },
  { n: 4, label: 'Decoration' },
  { n: 5, label: 'Quantity' },
  { n: 6, label: 'Details' },
]

export default function StepNav() {
  const { state, goToStep } = useBuilder()
  return (
    <>
      <div className="hidden sm:flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const done = s.n < state.step
          const active = s.n === state.step
          return (
            <div key={s.n} className="flex items-center">
              <button
                onClick={() => done && goToStep(s.n)}
                disabled={!done}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors
                  ${active ? 'text-text-primary font-medium' : ''}
                  ${done ? 'text-accent cursor-pointer hover:opacity-80' : ''}
                  ${!active && !done ? 'text-text-muted cursor-default' : ''}
                `}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                  ${active ? 'bg-accent text-text-primary' : ''}
                  ${done ? 'bg-accent/20 text-accent' : ''}
                  ${!active && !done ? 'bg-raised text-text-muted' : ''}
                `}>
                  {done ? '✓' : s.n}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px mx-1 ${s.n < state.step ? 'bg-accent/40' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex sm:hidden items-center justify-between mb-6">
        <span className="text-text-muted text-sm">Step {state.step} of {STEPS.length}</span>
        <span className="text-text-primary font-medium text-sm">{STEPS[state.step - 1]?.label}</span>
      </div>
    </>
  )
}
