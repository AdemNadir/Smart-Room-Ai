export default function PageHeader({ kicker, title, lede, actions }) {
  return (
    <header className="page-heading">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
