export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#7dd3fc',
  speed = '6s',
  children,
  ...rest
}) {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        '--star-color': color,
        '--star-speed': speed,
      }}
      {...rest}
    >
      <div className="border-gradient-bottom" />
      <div className="border-gradient-top" />
      <div className="inner-content">{children}</div>
    </Component>
  )
}