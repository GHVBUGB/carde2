import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      {/* 导航栏 */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">51</span>
            </div>
            <span className="text-xl font-bold text-brand-dark" dir="rtl">بطاقة Talk</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-brand-dark hover:bg-brand-primary/10" dir="rtl">
                تسجيل دخول المستخدم
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="text-brand-dark border-brand-primary hover:bg-brand-primary/10" dir="rtl">
                المدير
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary" dir="rtl">
                ابدأ الإنشاء
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative">
        {/* Hero 区域 */}
        <section className="px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" dir="rtl">
              <span className="text-brand-dark">اصنع بطاقة</span>
              <br />
              <span className="brand-text">رقمية مخصصة</span>
            </h1>
            
            <p className="text-xl text-brand-gray mb-8 max-w-2xl mx-auto leading-relaxed" dir="rtl">
              منصة بطاقة رقمية مصممة خصيصاً لموظفي 51Talk، لعرض صورتك المهنية،
              <br />
              وتعزيز تأثيرك التجاري، وجعل كل مقدمة أكثر تميزاً.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <Button className="btn-primary text-lg px-8 py-4 min-w-[160px]" dir="rtl">
                  ابدأ الآن
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="ghost" className="text-lg px-8 py-4 text-brand-dark hover:bg-brand-primary/10" dir="rtl">
                  عرض التجربة
                </Button>
              </Link>
            </div>

            {/* 数据展示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">1000+</div>
                <div className="text-sm text-brand-gray" dir="rtl">المستخدمون النشطون</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">5000+</div>
                <div className="text-sm text-brand-gray" dir="rtl">البطاقات المُنشأة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">99%</div>
                <div className="text-sm text-brand-gray" dir="rtl">الرضا</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">24/7</div>
                <div className="text-sm text-brand-gray" dir="rtl">الدعم التقني</div>
              </div>
            </div>
          </div>
        </section>

        {/* 管理员入口 */}
        <section className="py-12 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900" dir="rtl">منطقة المدير</h3>
              </div>
              <p className="text-gray-600 mb-4" dir="rtl">
                يمكن لمديري المنصة الوصول إلى لوحة المراقبة، وعرض إحصائيات المستخدمين واستخدام API
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/admin/login">
                  <Button className="bg-blue-600 hover:bg-blue-700" dir="rtl">
                    🔐 تسجيل دخول المدير
                  </Button>
                </Link>
                <Link href="/admin-portal">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" dir="rtl">
                    📊 بوابة المدير
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 功能特色 */}
        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-brand-dark" dir="rtl">
              لماذا تختارنا
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark" dir="rtl">معالجة الصور الذكية</h3>
                <p className="text-brand-gray" dir="rtl">
                  تقنية AI لقص الصور تلقائياً، إنشاء صورة شخصية احترافية بنقرة واحدة،
                  لجعل صورتك أكثر تميزاً ومهنية.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark" dir="rtl">التصميم بالسحب والإفلات</h3>
                <p className="text-brand-gray" dir="rtl">
                  محرر مرئي، تخطيط حر بالسحب والإفلات،
                  يمكنك إنشاء بطاقات جميلة دون خبرة في التصميم.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark" dir="rtl">آمن وموثوق</h3>
                <p className="text-brand-gray" dir="rtl">
                  حماية أمنية على مستوى المؤسسات، نقل البيانات المشفرة،
                  نحن نحمي أمان معلوماتك.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 演示区域 */}
        <section id="demo" className="px-6 py-16 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-brand-dark" dir="rtl">
              معاينة سريعة للنتيجة
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex-shrink-0"></div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-brand-dark mb-1" dir="rtl">الأستاذ تشانغ</h3>
                  <p className="text-brand-primary text-sm mb-2" dir="rtl">شريك النمو الرئيسي</p>
                  <div className="space-y-1 text-sm text-brand-gray" dir="rtl">
                    <p>📚 الطلاب المخدومون: 1,200+</p>
                    <p>⭐ معدل التقييم: 4.95/5.0</p>
                    <p>📞 رقم الاتصال: 138-0000-0000</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="badge-primary" dir="rtl">اختيار المعلم الأجنبي</span>
                    <span className="badge-secondary" dir="rtl">تغذية راجعة للتعلم</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-brand-gray mb-6" dir="rtl">
              يدعم تنسيقات تصدير متعددة، مشاركة بنقرة واحدة إلى WeChat والبريد الإلكتروني وغيرها
            </p>
            
            <Link href="/register">
              <Button className="btn-primary text-lg px-8 py-4" dir="rtl">
                ابدأ إنشاء بطاقتي
              </Button>
            </Link>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="bg-brand-dark text-white px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">51</span>
                  </div>
                  <span className="text-lg font-bold" dir="rtl">بطاقة Talk</span>
                </div>
                <p className="text-gray-400 text-sm" dir="rtl">
                  منصة بطاقة رقمية حصرية لموظفي 51Talk
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3" dir="rtl">روابط سريعة</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/login" className="hover:text-white transition-colors" dir="rtl">تسجيل الدخول</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors" dir="rtl">التسجيل</Link></li>
                  <li><Link href="#demo" className="hover:text-white transition-colors" dir="rtl">التجربة</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3" dir="rtl">المساعدة والدعم</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors" dir="rtl">دليل الاستخدام</a></li>
                  <li><a href="#" className="hover:text-white transition-colors" dir="rtl">الأسئلة الشائعة</a></li>
                  <li><a href="#" className="hover:text-white transition-colors" dir="rtl">الدعم التقني</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3" dir="rtl">اتصل بنا</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p dir="rtl">البريد الإلكتروني: tech-support@51talk.com</p>
                  <p dir="rtl">مجموعة دعم WeChat المؤسسي</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
              <p dir="rtl">&copy; 2024 51Talk Online Education. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
