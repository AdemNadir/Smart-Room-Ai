import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BlurText({ text, as = 'h1', speed = 40, initialBlurValue = '10px', ...rest }) {
  const ref = useRef(null)
  const Tag = as === 'h1' ? 'h1' : as === 'h2' ? 'h2' : as === 'h3' ? 'h3' : 'span'

  // Entrance animation using GSAP
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const textEl = element.querySelector('span') || element

    gsap.set(textEl, { opacity: 0, yPercent: 40, filter: `blur(${initialBlurValue})` })

    gsap.to(textEl, {
      opacity: 1,
      yPercent: 0,
      filter: 'blur(0px)',
      duration: 1.4,
      ease: 'power3.out',
      delay: 0.2
    })
  }, [text, as, speed, initialBlurValue])

  return (
    <Tag ref={ref} className="blur-text-container" {...rest}>
      <span className="blur-text-inner">{text}</span>
    </Tag>
  )
}