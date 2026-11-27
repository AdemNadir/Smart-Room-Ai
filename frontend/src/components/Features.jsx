import { useLang } from './LangContext'
import StarBorder from './StarBorder'

export default function Features() {
  const { lang } = useLang()

  const t = {
    featuresTitle: {
      en: 'Intelligent Room Discovery',
      fr: 'Découverte Intelligente de Salles',
      ar: 'اكتشاف الغرف الذكي',
    }[lang],
    featuresSubtitle: {
      en: 'Three AI capabilities that make finding the perfect classroom effortless.',
      fr: 'Trois capacités d\'IA qui rendent la recherche de salle de classe sans effort.',
      ar: 'ثلاث قدرات ذكاء اصطناعي تجعل العثور على الفصل الدراسي المثالي أمرًا سهلاً.',
    }[lang],
    feature1Title: {
      en: 'Natural-Language Search',
      fr: 'Recherche en Langage Naturel',
      ar: 'البحث باللغة الطبيعية',
    }[lang],
    feature1Desc: {
      en: 'Describe what you need in plain language and let AI find the perfect room.',
      fr: 'Décrivez ce dont vous avez besoin en langage simple et laissez l\'IA trouver la salle parfaite.',
      ar: 'وصف ما تحتاجه بلغة بسيطة ودع الذكاء الاصطناعي يجد الغرفة المثالية.',
    }[lang],
    feature2Title: {
      en: 'Explainable AI',
      fr: 'IA Explicable',
      ar: 'الذكاء الاصطناعي القابل للتفسير',
    }[lang],
    feature2Desc: {
      en: 'Every recommendation comes with clear reasoning and transparent ranking.',
      fr: 'Chaque recommandation est accompagnée d\'un raisonnement clair et d\'un classement transparent.',
      ar: 'كل توصية تأتي مع تفسير واضح وتصنيف شفاف.',
    }[lang],
    feature3Title: {
      en: 'Smart Insights',
      fr: 'Informations Intelligentes',
      ar: 'الرؤى الذكية',
    }[lang],
    feature3Desc: {
      en: 'Turn verified usage data into actionable administrative intelligence.',
      fr: 'Transformez les données d\'utilisation vérifiées en intelligence administrative exploitable.',
      ar: 'تحويل بيانات الاستخدام الموثقة إلى معلومات إدارية قابلة للتنفيذ.',
    }[lang],
  }

  return (
    <section className="section features-section">
      <h2 className="section-title">{t.featuresTitle}</h2>
      <p className="section-subtitle">{t.featuresSubtitle}</p>
      <div className="features-grid">
        <div className="feature-card">
          <h3>{t.feature1Title}</h3>
          <p>{t.feature1Desc}</p>
        </div>
        <div className="feature-card">
          <h3>{t.feature2Title}</h3>
          <p>{t.feature2Desc}</p>
        </div>
        <div className="feature-card">
          <h3>{t.feature3Title}</h3>
          <p>{t.feature3Desc}</p>
        </div>
      </div>
    </section>
  )
}