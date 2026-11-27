import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CountUp({ end = 100, duration = 2, start = 0, ...rest }) {
  const [value, setValue] = useState(start)
  const ref = useRef(null)
  const objRef = useRef({ val: start })

  useEffect(() => {
    if (!ref.current) return

    const obj = { val: start }
    objRef.current = obj

    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration: duration,
          ease: 'power2.out',
          onUpdate: () => {
            setValue(Math.round(obj.val))
          }
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [end, duration, start])

  return (
    <span ref={ref} {...rest}>{value.toLocaleString()}</span>
  )
}