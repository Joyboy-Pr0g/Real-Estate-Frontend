export type LegalDocumentId =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'messaging-policy'
  | 'listing-policy'
  | 'data-protection'
  | 'verification';

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  ordered?: string[];
  callout?: {
    title: string;
    body: string;
  };
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
}

type Locale = 'en' | 'ar';

const LEGAL_DOCUMENTS: Record<LegalDocumentId, Record<Locale, LegalDocument>> = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      subtitle:
        'How Yemen Real Estate collects, uses, and protects your personal information when you browse listings, create an account, or communicate with verified offices and listers.',
      lastUpdated: 'September 2025',
      intro: [
        'Yemen Real Estate ("we", "us", or "our") operates a digital marketplace that connects property seekers with verified real estate offices, individual listers, and property owners across Yemen. This Privacy Policy explains what information we collect, why we collect it, and the choices you have regarding your data.',
        'By using our website, mobile applications, or related services, you acknowledge that you have read and understood this policy. If you do not agree with our practices, please discontinue use of the platform and contact us with any questions before providing personal information.',
        'We may update this policy from time to time to reflect changes in our services, legal requirements, or industry standards. Material changes will be communicated through the platform or by other appropriate means.',
      ],
      sections: [
        {
          id: 'information-we-collect',
          title: 'Information We Collect',
          paragraphs: [
            'We collect information that you provide directly, information generated through your use of the platform, and limited information from third parties when necessary to operate our services.',
          ],
          bullets: [
            'Account details such as name, email address, phone number, and password when you register or update your profile.',
            'Listing-related information including property descriptions, photos, videos, location coordinates, pricing, and contact preferences submitted by offices and individual listers.',
            'Verification documents and business information submitted by real estate offices and individual listers during the approval process.',
            'Messaging content exchanged between users through our in-platform messaging system, including attachments related to property inquiries.',
            'Usage data such as pages viewed, search filters applied, saved listings, view history, and device or browser information collected through cookies and similar technologies.',
            'Support ticket details and correspondence when you contact our customer support team.',
          ],
        },
        {
          id: 'how-we-use-information',
          title: 'How We Use Your Information',
          paragraphs: [
            'We use collected information to operate, maintain, and improve Yemen Real Estate, and to provide a safe and trustworthy marketplace experience.',
          ],
          bullets: [
            'Display and manage property listings, office profiles, and individual lister accounts on the platform.',
            'Facilitate communication between property seekers, verified offices, and individual listers through our messaging features.',
            'Process verification requests for real estate offices and individual listers, including review of submitted documentation.',
            'Send service-related notifications such as account verification, listing status updates, message alerts, and security notices.',
            'Detect, investigate, and prevent fraud, abuse, unauthorized access, and violations of our terms and listing policies.',
            'Analyze aggregated usage patterns to improve search, recommendations, and platform performance.',
          ],
        },
        {
          id: 'sharing-and-disclosure',
          title: 'Sharing and Disclosure',
          paragraphs: [
            'We do not sell your personal information. We share data only as described below and always in accordance with applicable law.',
          ],
          bullets: [
            'With other users when you publish a listing, respond to inquiries, or send messages through the platform.',
            'With verified real estate offices and individual listers when you express interest in a property or initiate a conversation.',
            'With service providers who assist us with hosting, analytics, email delivery, and customer support, subject to confidentiality obligations.',
            'With law enforcement, regulators, or other parties when required by law, court order, or to protect the rights, property, or safety of Yemen Real Estate, our users, or the public.',
            'In connection with a merger, acquisition, or sale of assets, provided that the receiving entity agrees to honor this Privacy Policy.',
          ],
        },
        {
          id: 'data-retention',
          title: 'Data Retention',
          paragraphs: [
            'We retain personal information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.',
            'Listing data, messaging history, and verification records may be retained for a reasonable period after account closure to resolve disputes, enforce our policies, and comply with legal obligations. You may request deletion of your account data subject to applicable exceptions.',
          ],
        },
        {
          id: 'your-rights',
          title: 'Your Rights and Choices',
          bullets: [
            'Access and update your account information through your dashboard settings at any time.',
            'Manage notification preferences for messages, listing updates, and promotional communications.',
            'Request a copy of personal data we hold about you, or request correction of inaccurate information.',
            'Request deletion of your account and associated data, subject to legal and operational retention requirements.',
            'Control cookie preferences through your browser settings and our cookie policy.',
          ],
          callout: {
            title: 'Contact Us About Privacy',
            body: 'To exercise your privacy rights or ask questions about this policy, please contact us through the support channels listed on our Contact page. We will respond within a reasonable timeframe.',
          },
        },
        {
          id: 'security',
          title: 'Security Measures',
          paragraphs: [
            'We implement administrative, technical, and organizational safeguards designed to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted connections, access controls, and regular security reviews.',
            'No method of transmission over the internet or electronic storage is completely secure. While we strive to protect your personal information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة الخصوصية',
      subtitle:
        'كيف تجمع عقارات اليمن معلوماتك الشخصية وتستخدمها وتحميها عند تصفحك للإعلانات أو إنشاء حساب أو التواصل مع المكاتب العقارية المعتمدة والمعلنين.',
      lastUpdated: 'September 2025',
      intro: [
        'تُشغّل منصة عقارات اليمن ("نحن" أو "لنا") سوقاً رقمياً يربط الباحثين عن العقارات بالمكاتب العقارية المعتمدة والمعلنين الأفراد ومالكي العقارات في مختلف محافظات اليمن. توضح سياسة الخصوصية هذه المعلومات التي نجمعها، وأسباب جمعها، والخيارات المتاحة لك فيما يتعلق ببياناتك.',
        'باستخدامك لموقعنا أو تطبيقاتنا أو خدماتنا ذات الصلة، فإنك تقر بأنك قرأت هذه السياسة وفهمتها. إذا لم توافق على ممارساتنا، يرجى التوقف عن استخدام المنصة والتواصل معنا قبل تقديم أي معلومات شخصية.',
        'قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في خدماتنا أو المتطلبات القانونية أو المعايير الصناعية. سيتم إبلاغك بالتغييرات الجوهرية عبر المنصة أو بوسائل أخرى مناسبة.',
      ],
      sections: [
        {
          id: 'information-we-collect',
          title: 'المعلومات التي نجمعها',
          paragraphs: [
            'نجمع المعلومات التي تقدمها مباشرة، والمعلومات الناتجة عن استخدامك للمنصة، ومعلومات محدودة من أطراف ثالثة عند الضرورة لتشغيل خدماتنا.',
          ],
          bullets: [
            'بيانات الحساب مثل الاسم وعنوان البريد الإلكتروني ورقم الهاتف وكلمة المرور عند التسجيل أو تحديث ملفك الشخصي.',
            'معلومات الإعلانات بما في ذلك أوصاف العقارات والصور ومقاطع الفيديو وإحداثيات الموقع والأسعار وتفضيلات التواصل المقدمة من المكاتب والمعلنين الأفراد.',
            'مستندات التحقق ومعلومات الأعمال التي يقدمها المكاتب العقارية والمعلنون الأفراد خلال عملية الموافقة.',
            'محتوى الرسائل المتبادلة بين المستخدمين عبر نظام المراسلة داخل المنصة، بما في ذلك المرفقات المتعلقة بالاستفسارات العقارية.',
            'بيانات الاستخدام مثل الصفحات المعروضة وفلاتر البحث والإعلانات المحفوظة وسجل المشاهدة ومعلومات الجهاز أو المتصفح.',
            'تفاصيل تذاكر الدعم والمراسلات عند التواصل مع فريق خدمة العملاء.',
          ],
        },
        {
          id: 'how-we-use-information',
          title: 'كيف نستخدم معلوماتك',
          paragraphs: [
            'نستخدم المعلومات المجمعة لتشغيل وصيانة وتحسين منصة عقارات اليمن، وتوفير تجربة سوق آمنة وموثوقة.',
          ],
          bullets: [
            'عرض وإدارة إعلانات العقارات وملفات المكاتب وحسابات المعلنين الأفراد على المنصة.',
            'تسهيل التواصل بين الباحثين عن العقارات والمكاتب المعتمدة والمعلنين الأفراد عبر ميزات المراسلة.',
            'معالجة طلبات التحقق للمكاتب العقارية والمعلنين الأفراد، بما في ذلك مراجعة المستندات المقدمة.',
            'إرسال إشعارات متعلقة بالخدمة مثل التحقق من الحساب وتحديثات الإعلانات وتنبيهات الرسائل وإشعارات الأمان.',
            'اكتشاف ومنع الاحتيال وإساءة الاستخدام والوصول غير المصرح به وانتهاكات شروطنا وسياسات الإعلان.',
            'تحليل أنماط الاستخدام المجمعة لتحسين البحث والتوصيات وأداء المنصة.',
          ],
        },
        {
          id: 'sharing-and-disclosure',
          title: 'المشاركة والإفصاح',
          paragraphs: [
            'لا نبيع معلوماتك الشخصية. نشارك البيانات فقط كما هو موضح أدناه ووفقاً للقوانين المعمول بها.',
          ],
          bullets: [
            'مع مستخدمين آخرين عند نشر إعلان أو الرد على استفسارات أو إرسال رسائل عبر المنصة.',
            'مع المكاتب العقارية المعتمدة والمعلنين الأفراد عند إبداء اهتمامك بعقار أو بدء محادثة.',
            'مع مزودي الخدمات الذين يساعدوننا في الاستضافة والتحليلات وإرسال البريد ودعم العملاء، وفق التزامات السرية.',
            'مع الجهات القانونية أو التنظيمية عند الاقتضاء بموجب القانون أو أمر قضائي أو لحماية حقوق وسلامة المنصة ومستخدميها.',
            'في سياق اندماج أو استحواذ أو بيع أصول، بشرط التزام الجهة المستلمة بسياسة الخصوصية هذه.',
          ],
        },
        {
          id: 'data-retention',
          title: 'الاحتفاظ بالبيانات',
          paragraphs: [
            'نحتفظ بالمعلومات الشخصية طالما كان ذلك ضرورياً لتحقيق الأغراض الموضحة في هذه السياسة، ما لم تتطلب القوانين فترة احتفاظ أطول.',
            'قد تُحفظ بيانات الإعلانات وسجل المراسلات وسجلات التحقق لفترة معقولة بعد إغلاق الحساب لحل النزاعات وإنفاذ سياساتنا والامتثال للالتزامات القانونية. يمكنك طلب حذف بيانات حسابك وفق الاستثناءات المعمول بها.',
          ],
        },
        {
          id: 'your-rights',
          title: 'حقوقك وخياراتك',
          bullets: [
            'الوصول إلى معلومات حسابك وتحديثها من خلال إعدادات لوحة التحكم في أي وقت.',
            'إدارة تفضيلات الإشعارات للرسائل وتحديثات الإعلانات والاتصالات الترويجية.',
            'طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك، أو طلب تصحيح المعلومات غير الدقيقة.',
            'طلب حذف حسابك والبيانات المرتبطة به، وفق متطلبات الاحتفاظ القانونية والتشغيلية.',
            'التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح وسياسة ملفات تعريف الارتباط.',
          ],
          callout: {
            title: 'تواصل معنا بخصوص الخصوصية',
            body: 'لممارسة حقوقك المتعلقة بالخصوصية أو طرح أسئلة حول هذه السياسة، يرجى التواصل معنا عبر قنوات الدعم المدرجة في صفحة اتصل بنا. سنرد في إطار زمني معقول.',
          },
        },
        {
          id: 'security',
          title: 'إجراءات الأمان',
          paragraphs: [
            'نطبق ضمانات إدارية وتقنية وتنظيمية لحماية معلوماتك من الوصول أو التعديل أو الإفصاح أو الإتلاف غير المصرح به. تشمل هذه الإجراءات الاتصالات المشفرة وضوابط الوصول والمراجعات الأمنية الدورية.',
            'لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بالكامل. بينما نسعى لحماية معلوماتك الشخصية، لا يمكننا ضمان الأمان المطلق. أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك.',
          ],
        },
      ],
    },
  },

  terms: {
    en: {
      title: 'Terms of Service',
      subtitle:
        'The rules and conditions governing your use of Yemen Real Estate, including browsing listings, managing accounts, and interacting with verified offices and individual listers.',
      lastUpdated: 'September 2025',
      intro: [
        'Welcome to Yemen Real Estate. These Terms of Service ("Terms") form a binding agreement between you and Yemen Real Estate regarding your access to and use of our platform, including all websites, applications, and related services.',
        'Our platform enables users to search for residential and commercial properties, connect with verified real estate offices and individual listers, publish property listings, and communicate through integrated messaging tools. By creating an account or using our services, you agree to these Terms and our other applicable policies.',
        'If you are using the platform on behalf of a real estate office or business entity, you represent that you have authority to bind that entity to these Terms.',
      ],
      sections: [
        {
          id: 'eligibility',
          title: 'Eligibility and Account Registration',
          paragraphs: [
            'You must be at least 18 years of age and capable of entering into a legally binding agreement to use Yemen Real Estate. Accounts registered by real estate offices must be managed by authorized representatives of the business.',
          ],
          bullets: [
            'You agree to provide accurate, current, and complete information during registration and to keep your account details up to date.',
            'You are responsible for all activity that occurs under your account and must notify us immediately of any unauthorized use.',
            'We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.',
          ],
        },
        {
          id: 'platform-use',
          title: 'Permitted and Prohibited Use',
          paragraphs: [
            'You may use Yemen Real Estate for lawful purposes related to discovering, listing, or inquiring about real estate in Yemen. The following activities are strictly prohibited:',
          ],
          bullets: [
            'Posting false, misleading, or fraudulent property listings or office profiles.',
            'Circumventing our verification process or misrepresenting office or lister credentials.',
            'Harassing, threatening, or abusing other users through messaging or any other channel.',
            'Scraping, copying, or redistributing platform content without written permission.',
            'Using automated tools to create accounts, send messages, or manipulate listing rankings.',
            'Uploading malware, spam, or content that violates applicable laws or third-party rights.',
          ],
        },
        {
          id: 'listings-and-content',
          title: 'Listings and User Content',
          paragraphs: [
            'Offices, individual listers, and authorized users may submit property listings, photos, descriptions, and other content. By submitting content, you grant Yemen Real Estate a non-exclusive, worldwide license to display, distribute, and promote that content on and through the platform.',
            'You retain ownership of your content but represent that you have all necessary rights to publish it and that it complies with our Listing Policy. We may remove content that violates our policies or applicable law without prior notice.',
          ],
        },
        {
          id: 'verification-and-offices',
          title: 'Verified Offices and Individual Listers',
          paragraphs: [
            'Real estate offices and individual listers may apply for verification status on the platform. Verification indicates that we have reviewed submitted documentation, but it does not constitute an endorsement of any specific transaction, property, or business practice.',
            'Verified status may be revoked if an office or lister fails to maintain accurate information, receives substantiated complaints, or violates platform policies.',
          ],
          callout: {
            title: 'No Agency Relationship',
            body: 'Yemen Real Estate is a marketplace platform. We are not a party to any transaction between users and do not act as a real estate broker, agent, or legal advisor. Users are solely responsible for conducting due diligence before entering into any property agreement.',
          },
        },
        {
          id: 'fees-and-payments',
          title: 'Fees and Payments',
          paragraphs: [
            'Certain features or services may be subject to fees as disclosed on the platform at the time of use. All fees are quoted in the currency displayed on the platform and are non-refundable unless otherwise stated.',
            'We reserve the right to modify pricing for future services with reasonable notice. Continued use of paid features after a price change constitutes acceptance of the new fees.',
          ],
        },
        {
          id: 'liability-and-termination',
          title: 'Limitation of Liability and Termination',
          paragraphs: [
            'Yemen Real Estate is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform.',
            'We may suspend or terminate your access at any time for violations of these Terms or for any reason with notice where practicable. You may close your account at any time through your account settings or by contacting support.',
          ],
        },
      ],
    },
    ar: {
      title: 'شروط الخدمة',
      subtitle:
        'القواعد والأحكام التي تحكم استخدامك لمنصة عقارات اليمن، بما في ذلك تصفح الإعلانات وإدارة الحسابات والتفاعل مع المكاتب المعتمدة والمعلنين الأفراد.',
      lastUpdated: 'September 2025',
      intro: [
        'مرحباً بك في عقارات اليمن. تشكل شروط الخدمة هذه ("الشروط") اتفاقاً ملزماً بينك وبين عقارات اليمن فيما يتعلق بوصولك إلى منصتنا واستخدامها، بما في ذلك جميع المواقع والتطبيقات والخدمات ذات الصلة.',
        'تتيح منصتنا للمستخدمين البحث عن العقارات السكنية والتجارية والتواصل مع المكاتب العقارية المعتمدة والمعلنين الأفراد ونشر إعلانات العقارات والمراسلة عبر أدوات متكاملة. بإنشائك حساباً أو استخدامك لخدماتنا، فإنك توافق على هذه الشروط وسياساتنا الأخرى المعمول بها.',
        'إذا كنت تستخدم المنصة نيابة عن مكتب عقاري أو كيان تجاري، فإنك تقر بأن لديك الصلاحية لإلزام ذلك الكيان بهذه الشروط.',
      ],
      sections: [
        {
          id: 'eligibility',
          title: 'الأهلية وتسجيل الحساب',
          paragraphs: [
            'يجب أن يكون عمرك 18 عاماً على الأقل وأن تكون قادراً على إبرام اتفاق ملزم لاستخدام عقارات اليمن. يجب أن تُدار حسابات المكاتب العقارية من قبل ممثلين مفوضين عن النشاط التجاري.',
          ],
          bullets: [
            'توافق على تقديم معلومات دقيقة وحالية وكاملة أثناء التسجيل والحفاظ على تحديث بيانات حسابك.',
            'أنت مسؤول عن جميع الأنشطة التي تتم تحت حسابك ويجب إبلاغنا فوراً بأي استخدام غير مصرح به.',
            'نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تقدم معلومات كاذبة أو تنتهك هذه الشروط.',
          ],
        },
        {
          id: 'platform-use',
          title: 'الاستخدام المسموح والمحظور',
          paragraphs: [
            'يمكنك استخدام عقارات اليمن لأغراض قانونية متعلقة باكتشاف أو إدراج أو الاستفسار عن العقارات في اليمن. الأنشطة التالية محظورة تماماً:',
          ],
          bullets: [
            'نشر إعلانات عقارية أو ملفات مكاتب كاذبة أو مضللة أو احتيالية.',
            'التحايل على عملية التحقق أو تقديم بيانات كاذبة عن المكتب أو المعلن.',
            'مضايقة أو تهديد أو إساءة معاملة المستخدمين الآخرين عبر المراسلة أو أي قناة أخرى.',
            'استخراج أو نسخ أو إعادة توزيع محتوى المنصة دون إذن كتابي.',
            'استخدام أدوات آلية لإنشاء حسابات أو إرسال رسائل أو التلاعب بتصنيف الإعلانات.',
            'رفع برمجيات خبيثة أو رسائل مزعجة أو محتوى ينتهك القوانين أو حقوق الغير.',
          ],
        },
        {
          id: 'listings-and-content',
          title: 'الإعلانات ومحتوى المستخدم',
          paragraphs: [
            'يمكن للمكاتب والمعلنين الأفراد والمستخدمين المفوضين تقديم إعلانات العقارات والصور والأوصاف ومحتوى آخر. بتقديم المحتوى، تمنح عقارات اليمن ترخيصاً غير حصري وعالمياً لعرض وتوزيع وترويج ذلك المحتوى عبر المنصة.',
            'تحتفظ بملكية محتواك لكنك تقر بأن لديك جميع الحقوق اللازمة لنشره وأنه يتوافق مع سياسة الإعلان. قد نزيل المحتوى الذي ينتهك سياساتنا أو القانون المعمول به دون إشعار مسبق.',
          ],
        },
        {
          id: 'verification-and-offices',
          title: 'المكاتب المعتمدة والمعلنون الأفراد',
          paragraphs: [
            'يمكن للمكاتب العقارية والمعلنين الأفراد التقدم للحصول على حالة التحقق على المنصة. يشير التحقق إلى أننا راجعنا المستندات المقدمة، لكنه لا يُعدّ تأييداً لأي معاملة أو عقار أو ممارسة تجارية محددة.',
            'قد يُلغى وضع التحقق إذا فشل المكتب أو المعلن في الحفاظ على معلومات دقيقة أو تلقى شكاوى مثبتة أو انتهك سياسات المنصة.',
          ],
          callout: {
            title: 'لا علاقة وكالة',
            body: 'عقارات اليمن منصة سوق. لسنا طرفاً في أي معاملة بين المستخدمين ولا نعمل كوسيط عقاري أو وكيل أو مستشار قانوني. المستخدمون مسؤولون وحدهم عن إجراء العناية الواجبة قبل الدخول في أي اتفاق عقاري.',
          },
        },
        {
          id: 'fees-and-payments',
          title: 'الرسوم والمدفوعات',
          paragraphs: [
            'قد تخضع بعض الميزات أو الخدمات لرسوم كما هو موضح على المنصة وقت الاستخدام. جميع الرسوم معروضة بالعملة المعروضة على المنصة وغير قابلة للاسترداد ما لم يُذكر خلاف ذلك.',
            'نحتفظ بالحق في تعديل الأسعار للخدمات المستقبلية مع إشعار معقول. الاستمرار في استخدام الميزات المدفوعة بعد تغيير السعر يُعدّ قبولاً للرسوم الجديدة.',
          ],
        },
        {
          id: 'liability-and-termination',
          title: 'حدود المسؤولية والإنهاء',
          paragraphs: [
            'تُقدَّم عقارات اليمن "كما هي" و"حسب التوفر". إلى أقصى حد يسمح به القانون، نُخلي مسؤوليتنا عن جميع الضمانات ولا نكون مسؤولين عن الأضرار غير المباشرة أو العرضية أو التبعية الناشئة عن استخدامك للمنصة.',
            'قد نعلق أو ننهي وصولك في أي وقت لانتهاك هذه الشروط أو لأي سبب مع إشعار حيثما أمكن. يمكنك إغلاق حسابك في أي وقت من خلال إعدادات الحساب أو بالتواصل مع الدعم.',
          ],
        },
      ],
    },
  },

  cookies: {
    en: {
      title: 'Cookie Policy',
      subtitle:
        'How Yemen Real Estate uses cookies and similar technologies to improve your experience when searching for properties and managing your account.',
      lastUpdated: 'September 2025',
      intro: [
        'This Cookie Policy explains how Yemen Real Estate uses cookies, local storage, and similar tracking technologies when you visit our website or use our applications. It should be read alongside our Privacy Policy.',
        'Cookies are small text files stored on your device that help us recognize your browser, remember your preferences, and understand how you interact with our platform.',
        'By continuing to use Yemen Real Estate, you consent to our use of cookies as described in this policy, unless you adjust your browser settings or cookie preferences to limit certain types of cookies.',
      ],
      sections: [
        {
          id: 'types-of-cookies',
          title: 'Types of Cookies We Use',
          paragraphs: [
            'We use different categories of cookies to operate and improve our real estate marketplace:',
          ],
          bullets: [
            'Essential cookies: Required for core platform functions such as authentication, session management, security, and load balancing. The platform cannot function properly without these cookies.',
            'Functional cookies: Remember your language preference, saved searches, favorite listings, and dashboard settings to provide a personalized experience.',
            'Analytics cookies: Help us understand how users navigate listings, use map search, and interact with office profiles so we can improve platform performance.',
            'Preference cookies: Store your notification settings, cookie consent choices, and display preferences across sessions.',
          ],
        },
        {
          id: 'third-party-cookies',
          title: 'Third-Party Cookies',
          paragraphs: [
            'Some cookies may be placed by trusted third-party service providers that assist us with analytics, content delivery, or embedded map features used to display property locations across Yemeni cities.',
            'These providers process data according to their own privacy policies. We require our partners to handle data in compliance with applicable privacy standards and only for the purposes we authorize.',
          ],
        },
        {
          id: 'local-storage',
          title: 'Local Storage and Similar Technologies',
          paragraphs: [
            'In addition to cookies, we may use local storage, session storage, and similar browser technologies to cache listing data, store draft messages, and maintain application state for a smoother user experience.',
            'These technologies do not transmit data to our servers unless you take an action that requires synchronization, such as saving a listing or sending a message.',
          ],
        },
        {
          id: 'managing-cookies',
          title: 'Managing Your Cookie Preferences',
          bullets: [
            'Most browsers allow you to block or delete cookies through their settings menu. Note that blocking essential cookies may prevent you from logging in or using key platform features.',
            'You can clear cookies at any time, which will reset your saved preferences and may require you to sign in again.',
            'For analytics cookies, you may opt out through your browser\'s "Do Not Track" setting where supported, though our platform may not respond to all such signals.',
          ],
          callout: {
            title: 'Cookie Consent',
            body: 'When you first visit Yemen Real Estate, we may display a cookie banner allowing you to accept or customize non-essential cookies. Your choice is stored so we can honor your preferences on future visits.',
          },
        },
        {
          id: 'updates',
          title: 'Updates to This Policy',
          paragraphs: [
            'We may update this Cookie Policy to reflect changes in technology, legal requirements, or our use of cookies. The "Last Updated" date at the top of this page indicates when the policy was most recently revised.',
            'We encourage you to review this policy periodically to stay informed about how we use cookies on our platform.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة ملفات تعريف الارتباط',
      subtitle:
        'كيف تستخدم عقارات اليمن ملفات تعريف الارتباط والتقنيات المماثلة لتحسين تجربتك عند البحث عن العقارات وإدارة حسابك.',
      lastUpdated: 'September 2025',
      intro: [
        'توضح سياسة ملفات تعريف الارتباط هذه كيف تستخدم عقارات اليمن ملفات تعريف الارتباط والتخزين المحلي وتقنيات التتبع المماثلة عند زيارتك لموقعنا أو استخدام تطبيقاتنا. يجب قراءتها إلى جانب سياسة الخصوصية.',
        'ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك وتساعدنا في التعرف على متصفحك وتذكر تفضيلاتك وفهم كيفية تفاعلك مع منصتنا.',
        'باستمرارك في استخدام عقارات اليمن، فإنك توافق على استخدامنا لملفات تعريف الارتباط كما هو موضح في هذه السياسة، ما لم تعدّل إعدادات متصفحك أو تفضيلات ملفات تعريف الارتباط.',
      ],
      sections: [
        {
          id: 'types-of-cookies',
          title: 'أنواع ملفات تعريف الارتباط التي نستخدمها',
          paragraphs: [
            'نستخدم فئات مختلفة من ملفات تعريف الارتباط لتشغيل وتحسين سوقنا العقاري:',
          ],
          bullets: [
            'ملفات أساسية: ضرورية لوظائف المنصة الأساسية مثل المصادقة وإدارة الجلسات والأمان وموازنة التحميل.',
            'ملفات وظيفية: تتذكر تفضيل اللغة والبحوث المحفوظة والإعلانات المفضلة وإعدادات لوحة التحكم.',
            'ملفات تحليلية: تساعدنا على فهم كيفية تنقل المستخدمين بين الإعلانات واستخدام البحث على الخريطة والتفاعل مع ملفات المكاتب.',
            'ملفات تفضيلات: تخزن إعدادات الإشعارات وخيارات الموافقة على ملفات تعريف الارتباط وتفضيلات العرض عبر الجلسات.',
          ],
        },
        {
          id: 'third-party-cookies',
          title: 'ملفات تعريف ارتباط الطرف الثالث',
          paragraphs: [
            'قد تُوضَع بعض ملفات تعريف الارتباط من قبل مزودي خدمات موثوقين يساعدوننا في التحليلات وتوصيل المحتوى أو ميزات الخرائط المدمجة لعرض مواقع العقارات في مدن يمنية مختلفة.',
            'تعالج هذه الجهات البيانات وفق سياسات الخصوصية الخاصة بها. نُلزم شركاءنا بمعالجة البيانات وفق معايير الخصوصية المعمول بها وللأغراض التي نُصرّح بها فقط.',
          ],
        },
        {
          id: 'local-storage',
          title: 'التخزين المحلي والتقنيات المماثلة',
          paragraphs: [
            'بالإضافة إلى ملفات تعريف الارتباط، قد نستخدم التخزين المحلي وتخزين الجلسة وتقنيات متصفح مماثلة لتخزين بيانات الإعلانات مؤقتاً وحفظ مسودات الرسائل والحفاظ على حالة التطبيق.',
            'لا تنقل هذه التقنيات البيانات إلى خوادمنا إلا عند اتخاذ إجراء يتطلب المزامنة، مثل حفظ إعلان أو إرسال رسالة.',
          ],
        },
        {
          id: 'managing-cookies',
          title: 'إدارة تفضيلات ملفات تعريف الارتباط',
          bullets: [
            'تسمح معظم المتصفحات بحظر أو حذف ملفات تعريف الارتباط من خلال قائمة الإعدادات. قد يمنعك حظر الملفات الأساسية من تسجيل الدخول أو استخدام الميزات الرئيسية.',
            'يمكنك مسح ملفات تعريف الارتباط في أي وقت، مما يعيد تعيين تفضيلاتك المحفوظة وقد يتطلب تسجيل الدخول مرة أخرى.',
            'بالنسبة للملفات التحليلية، يمكنك إلغاء الاشتراك من خلال إعداد "عدم التتبع" في متصفحك حيثما كان مدعوماً.',
          ],
          callout: {
            title: 'الموافقة على ملفات تعريف الارتباط',
            body: 'عند زيارتك الأولى لعقارات اليمن، قد نعرض شريط ملفات تعريف ارتباط يتيح لك قبول أو تخصيص الملفات غير الأساسية. يُخزَّن اختيارك لاحترام تفضيلاتك في الزيارات المستقبلية.',
          },
        },
        {
          id: 'updates',
          title: 'تحديثات هذه السياسة',
          paragraphs: [
            'قد نحدّث سياسة ملفات تعريف الارتباط هذه لتعكس التغييرات في التكنولوجيا أو المتطلبات القانونية أو استخدامنا لملفات تعريف الارتباط. يشير تاريخ "آخر تحديث" في أعلى هذه الصفحة إلى آخر مراجعة.',
            'نشجعك على مراجعة هذه السياسة دورياً للبقاء على اطلاع بكيفية استخدامنا لملفات تعريف الارتباط على منصتنا.',
          ],
        },
      ],
    },
  },

  'messaging-policy': {
    en: {
      title: 'Messaging Policy',
      subtitle:
        'Guidelines for using Yemen Real Estate messaging to inquire about properties, communicate with verified offices, and interact with individual listers.',
      lastUpdated: 'September 2025',
      intro: [
        'Yemen Real Estate provides an in-platform messaging system that allows property seekers to contact verified real estate offices and individual listers directly about listings. This Messaging Policy sets out the rules for acceptable use of these communication tools.',
        'Our messaging feature is designed to facilitate legitimate property inquiries while protecting users from spam, harassment, and fraudulent activity. All messages are subject to automated and manual review when reported or flagged for policy violations.',
        'By using our messaging services, you agree to communicate respectfully, honestly, and in compliance with this policy and our Terms of Service.',
      ],
      sections: [
        {
          id: 'purpose',
          title: 'Purpose of Platform Messaging',
          paragraphs: [
            'The messaging system exists to connect buyers, renters, and investors with listing owners and authorized office representatives. It should be used exclusively for property-related inquiries, scheduling viewings, requesting additional information, and negotiating terms preliminary to an in-person meeting.',
          ],
          bullets: [
            'Inquiries about property availability, pricing, specifications, and location details.',
            'Requests for additional photos, videos, or documentation related to a listing.',
            'Scheduling property viewings or meetings with verified office agents.',
            'Follow-up communication regarding an active listing or prior inquiry.',
          ],
        },
        {
          id: 'prohibited-conduct',
          title: 'Prohibited Conduct',
          paragraphs: [
            'The following behaviors are prohibited in all platform messages and may result in account suspension, messaging restrictions, or permanent ban:',
          ],
          bullets: [
            'Sending unsolicited promotional messages غير ذات صلة to property listings on the platform.',
            'Harassment, threats, تمييزية language, or abusive content directed at any user.',
            'Sharing false property information or attempting to redirect users to fraudulent listings outside the platform.',
            'Requesting or sharing financial account details, wire transfer instructions, or advance payments before an in-person verification of the property and parties involved.',
            'Using messaging to circumvent verification requirements or impersonate a verified office or lister.',
            'Automated or bulk messaging, spam, or any use of bots to contact users.',
          ],
        },
        {
          id: 'privacy-and-recording',
          title: 'Privacy and Message Retention',
          paragraphs: [
            'Messages exchanged through Yemen Real Estate are stored on our servers to enable conversation history, dispute resolution, and safety monitoring. Message content may be reviewed by our moderation team when a report is filed or when automated systems detect potential violations.',
            'Do not share sensitive personal information such as national identification numbers, passwords, or financial credentials through platform messaging. Use caution when arranging in-person meetings and prefer public locations for initial property viewings.',
          ],
        },
        {
          id: 'reporting-and-blocking',
          title: 'Reporting and Blocking',
          paragraphs: [
            'If you receive inappropriate, suspicious, or harassing messages, you can report the conversation through the reporting tools available in your message thread. You may also block a user to prevent further contact through the platform.',
          ],
          bullets: [
            'Reports are reviewed by our moderation team, typically within a few business days.',
            'Repeated or severe violations may result in account suspension for the offending user.',
            'Blocking a user does not delete prior message history but prevents new messages from that user.',
          ],
          callout: {
            title: 'Safety First',
            body: 'Never send money or make payments based solely on messages received through the platform. Always verify the property, the lister\'s identity, and the legitimacy of any transaction in person before committing to a purchase or rental agreement.',
          },
        },
        {
          id: 'office-and-lister-responsibilities',
          title: 'Responsibilities of Offices and Listers',
          bullets: [
            'Respond to legitimate inquiries in a timely and professional manner.',
            'Provide accurate information about listed properties and clearly disclose any material conditions or limitations.',
            'Do not share contact information in messages for the purpose of circumventing platform features or fees where applicable.',
            'Report suspicious buyer behavior or fraud attempts to Yemen Real Estate support promptly.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة المراسلة',
      subtitle:
        'إرشادات استخدام مراسلة عقارات اليمن للاستفسار عن العقارات والتواصل مع المكاتب المعتمدة والمعلنين الأفراد.',
      lastUpdated: 'September 2025',
      intro: [
        'توفر عقارات اليمن نظام مراسلة داخل المنصة يتيح للباحثين عن العقارات التواصل مباشرة مع المكاتب العقارية المعتمدة والمعلنين الأفراد بخصوص الإعلانات. تحدد سياسة المراسلة هذه قواعد الاستخدام المقبول لأدوات التواصل هذه.',
        'صُمِّمت ميزة المراسلة لتسهيل الاستفسارات العقارية المشروعة مع حماية المستخدمين من الرسائل المزعجة والمضايقة والأنشطة الاحتيالية. تخضع جميع الرسائل للمراجعة الآلية واليدوية عند الإبلاغ عنها أو عند الإشارة إلى انتهاكات السياسة.',
        'باستخدامك لخدمات المراسلة، فإنك توافق على التواصل باحترام وصدق ووفق هذه السياسة وشروط الخدمة.',
      ],
      sections: [
        {
          id: 'purpose',
          title: 'غرض مراسلة المنصة',
          paragraphs: [
            'يوجد نظام المراسلة لربط المشترين والمستأجرين والمستثمرين بمالكي الإعلانات وممثلي المكاتب المفوضين. يجب استخدامه حصرياً للاستفسارات العقارية وجدولة المعاينات وطلب معلومات إضافية والتفاوض الأولي قبل اللقاء الشخصي.',
          ],
          bullets: [
            'الاستفسار عن توفر العقار والسعر والمواصفات وتفاصيل الموقع.',
            'طلب صور أو مقاطع فيديو أو مستندات إضافية متعلقة بالإعلان.',
            'جدولة معاينات العقار أو مواعيد مع وكلاء المكاتب المعتمدة.',
            'متابعة التواصل بخصوص إعلان نشط أو استفسار سابق.',
          ],
        },
        {
          id: 'prohibited-conduct',
          title: 'السلوك المحظور',
          paragraphs: [
            'السلوكيات التالية محظورة في جميع رسائل المنصة وقد تؤدي إلى تعليق الحساب أو تقييد المراسلة أو الحظر الدائم:',
          ],
          bullets: [
            'إرسال رسائل ترويجية غير مرغوب فيها لا علاقة لها بإعلانات العقارات على المنصة.',
            'المضايقة أو التهديد أو لغة تمييزية أو محتوى مسيء موجه لأي مستخدم.',
            'مشاركة معلومات عقارية كاذبة أو محاولة توجيه المستخدمين إلى إعلانات احتيالية خارج المنصة.',
            'طلب أو مشاركة تفاصيل حسابات مالية أو تعليمات تحويل أو دفعات مقدمة قبل التحقق الشخصي من العقار والأطراف.',
            'استخدام المراسلة للتحايل على متطلبات التحقق أو انتحال شخصية مكتب أو معلن معتمد.',
            'المراسلة الآلية أو الجماعية أو الرسائل المزعجة أو استخدام برامج آلية للتواصل مع المستخدمين.',
          ],
        },
        {
          id: 'privacy-and-recording',
          title: 'الخصوصية والاحتفاظ بالرسائل',
          paragraphs: [
            'تُخزَّن الرسائل المتبادلة عبر عقارات اليمن على خوادمنا لتمكين سجل المحادثات وحل النزاعات ومراقبة السلامة. قد يراجع فريق الإشراف محتوى الرسائل عند تقديم بلاغ أو عند اكتشاف أنظمتنا الآلية انتهاكات محتملة.',
            'لا تشارك معلومات شخصية حساسة مثل أرقام الهوية أو كلمات المرور أو بيانات مالية عبر مراسلة المنصة. توخَّ الحذر عند ترتيب لقاءات شخصية وفضّل الأماكن العامة للمعاينات الأولية.',
          ],
        },
        {
          id: 'reporting-and-blocking',
          title: 'الإبلاغ والحظر',
          paragraphs: [
            'إذا تلقيت رسائل غير لائقة أو مشبوهة أو مضايقة، يمكنك الإبلاغ عن المحادثة عبر أدوات الإبلاغ في سلسلة الرسائل. يمكنك أيضاً حظر مستخدم لمنع أي تواصل إضافي عبر المنصة.',
          ],
          bullets: [
            'يراجع فريق الإشراف البلاغات، عادةً خلال بضعة أيام عمل.',
            'قد تؤدي الانتهاكات المتكررة أو الخطيرة إلى تعليق حساب المخالف.',
            'حظر مستخدم لا يحذف سجل الرسائل السابق لكنه يمنع رسائل جديدة من ذلك المستخدم.',
          ],
          callout: {
            title: 'السلامة أولاً',
            body: 'لا ترسل أموالاً أو تقوم بمدفوعات بناءً على الرسائل الواردة عبر المنصة فقط. تحقق دائماً من العقار وهوية المعلن وشرعية أي معاملة شخصياً قبل الالتزام بشراء أو إيجار.',
          },
        },
        {
          id: 'office-and-lister-responsibilities',
          title: 'مسؤوليات المكاتب والمعلنين',
          bullets: [
            'الرد على الاستفسارات المشروعة في وقت مناسب وبأسلوب مهني.',
            'تقديم معلومات دقيقة عن العقارات المدرجة والإفصاح بوضوح عن أي ظروف أو قيود جوهرية.',
            'عدم مشاركة معلومات اتصال في الرسائل لغرض التحايل على ميزات المنصة أو الرسوم حيث ينطبق ذلك.',
            'الإبلاغ عن سلوك مشترٍ مشبوه أو محاولات احتيال إلى دعم عقارات اليمن دون تأخير.',
          ],
        },
      ],
    },
  },

  'listing-policy': {
    en: {
      title: 'Listing Policy',
      subtitle:
        'Standards and requirements for publishing property listings on Yemen Real Estate, applicable to verified offices and individual listers.',
      lastUpdated: 'September 2025',
      intro: [
        'Yemen Real Estate is committed to maintaining a trustworthy marketplace where property seekers can browse accurate, up-to-date listings across Yemen. This Listing Policy defines the requirements for all property advertisements published on our platform.',
        'All listings must comply with applicable Yemeni laws and regulations, including those related to property ownership, rental agreements, and truthful advertising. Offices and individual listers are solely responsible for the accuracy and شرعية of their listings.',
        'We reserve the right to review, edit, reject, or remove any listing that violates this policy without prior notice. Repeated violations may result in account suspension or loss of verification status.',
      ],
      sections: [
        {
          id: 'listing-requirements',
          title: 'Listing Requirements',
          paragraphs: [
            'Every property listing must include complete and accurate information to help users make informed decisions:',
          ],
          bullets: [
            'Correct property type, subtype, and transaction type (sale, rent, or other supported categories).',
            'Accurate location including city, neighborhood, and map coordinates where available.',
            'Honest pricing in the currency displayed on the platform, with clear indication of whether the price is negotiable.',
            'Accurate property specifications such as area, number of rooms, bathrooms, floors, and key features.',
            'At least one genuine photograph of the property. Stock images or photos of غير ذات صلة properties are prohibited.',
            'A clear, descriptive title and detailed description written in the language of the listing or both Arabic and English.',
          ],
        },
        {
          id: 'prohibited-listings',
          title: 'Prohibited Listings and Content',
          paragraphs: [
            'The following types of listings and content are not permitted on Yemen Real Estate:',
          ],
          bullets: [
            'Properties that the lister does not have legal authority to advertise or transact.',
            'Duplicate listings for the same property posted by the same or different accounts to manipulate search results.',
            'Listings with intentionally false pricing, such as unrealistically low prices designed to attract clicks.',
            'Properties located outside Yemen unless explicitly supported by platform features.',
            'Listings promoting illegal activities, تمييزية practices, or content that violates الآداب العامة standards.',
            'Misleading claims about verification status, office credentials, or property ownership.',
          ],
        },
        {
          id: 'photos-and-media',
          title: 'Photos, Videos, and Media Standards',
          bullets: [
            'Photos must depict the actual property being advertised, taken within a reasonable timeframe.',
            'Watermarks may include the office or lister name but دون أن تحجب key property features.',
            'Videos must be relevant to the listed property and must not contain inappropriate content.',
            'Do not include personal contact information, QR codes, or external website URLs overlaid on images to circumvent platform messaging.',
          ],
        },
        {
          id: 'listing-lifecycle',
          title: 'Listing Lifecycle and Status Management',
          paragraphs: [
            'Listers must keep listing status current. Properties that have been sold, rented, or withdrawn must be marked accordingly or removed from the platform promptly.',
          ],
          ordered: [
            'Draft: Listings saved but not yet visible to the public.',
            'Published: Active listings visible in search results and on the marketplace.',
            'Sold/Rented: Listings marked as no longer available, retained for record-keeping but excluded from active search.',
            'Removed: Listings deleted or removed by the lister or by platform moderation.',
          ],
          callout: {
            title: 'Accuracy Matters',
            body: 'Outdated or unavailable listings create a poor experience for property seekers and may result in penalties for the listing account. We monitor listing freshness and may automatically archive listings that appear inactive for extended periods.',
          },
        },
        {
          id: 'office-vs-individual',
          title: 'Office Listings vs. Individual Lister Listings',
          paragraphs: [
            'Verified real estate offices may publish listings on behalf of clients and must clearly indicate when a property is listed by an authorized office representative. Individual listers may publish listings for properties they own or have explicit authorization to advertise.',
            'Offices must not publish listings on behalf of unverified third parties without proper documentation. Individual listers must complete identity verification before publishing their first listing.',
          ],
        },
        {
          id: 'enforcement',
          title: 'Enforcement and Appeals',
          paragraphs: [
            'Users may report listings that appear to violate this policy through the report feature on each listing page. Our moderation team investigates reports and takes appropriate action, which may include requesting corrections, temporarily hiding a listing, or permanently removing it.',
            'If your listing is removed or your account is restricted, you may appeal the decision by contacting support with relevant documentation. We review appeals on a case-by-case basis and respond within a reasonable timeframe.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة الإعلانات',
      subtitle:
        'المعايير والمتطلبات لنشر إعلانات العقارات على عقارات اليمن، وتنطبق للمكاتب المعتمدة والمعلنين الأفراد.',
      lastUpdated: 'September 2025',
      intro: [
        'تلتزم عقارات اليمن بالحفاظ على سوق موثوق يمكن فيه للباحثين عن العقارات تصفح إعلانات دقيقة ومحدّثة في مختلف أنحاء اليمن. تحدد سياسة الإعلانات هذه متطلبات جميع إعلانات العقارات المنشورة على منصتنا.',
        'يجب أن تتوافق جميع الإعلانات مع القوانين واللوائح اليمنية المعمول بها، بما في ذلك التي تتعلق بملكية العقارات وعقود الإيجار والإعلان الصادق. المكاتب والمعلنون الأفراد مسؤولون وحدهم عن دقة وشرعية إعلاناتهم.',
        'نحتفظ بالحق في مراجعة أو تعديل أو رفض أو إزالة أي إعلان ينتهك هذه السياسة دون إشعار مسبق. قد تؤدي الانتهاكات المتكررة إلى تعليق الحساب أو فقدان حالة التحقق.',
      ],
      sections: [
        {
          id: 'listing-requirements',
          title: 'متطلبات الإعلان',
          paragraphs: [
            'يجب أن يتضمن كل إعلان عقاري معلومات كاملة ودقيقة لمساعدة المستخدمين على اتخاذ قرارات مدروسة:',
          ],
          bullets: [
            'نوع العقار والنوع الفرعي ونوع المعاملة الصحيحة (بيع، إيجار، أو فئات مدعومة أخرى).',
            'موقع دقيق يشمل المدينة والحي وإحداثيات الخريطة حيثما توفرت.',
            'تسعير صادق بالعملة المعروضة على المنصة، مع إشارة واضحة إذا كان السعر قابلاً للتفاوض.',
            'مواصفات دقيقة مثل المساحة وعدد الغرف والحمامات والطوابق والميزات الرئيسية.',
            'صورة حقيقية واحدة على الأقل للعقار. الصور الجاهزة أو صور عقارات غير ذات صلة محظورة.',
            'عنوان واضح ووصف تفصيلي باللغة الإعلان أو بالعربية والإنجليزية.',
          ],
        },
        {
          id: 'prohibited-listings',
          title: 'الإعلانات والمحتوى المحظور',
          paragraphs: [
            'أنواع الإعلانات والمحتوى التالية غير مسموح بها على عقارات اليمن:',
          ],
          bullets: [
            'عقارات ليس للمعلن صلاحية قانونية للإعلان عنها أو التصرف بها.',
            'إعلانات مكررة لنفس العقار من نفس or different accounts لل manipulate نتائج البحث.',
            'إعلانات بتسعير كاذب عمداً، مثل أسعار منخفضة بشكل غير واقعي لجذب النقرات.',
            'عقارات خارج اليمن ما لم تدعمها ميزات المنصة صراحةً.',
            'إعلانات الترويج لأنشطة غير قانونية أو ممارسات تمييزية أو محتوى ينتهك معايير الآداب العامة.',
            'ادعاءات مضللة عن حالة التحقق أو اعتماد المكتب أو ملكية العقار.',
          ],
        },
        {
          id: 'photos-and-media',
          title: 'معايير الصور والفيديو والوسائط',
          bullets: [
            'يجب أن تصور الصور العقار الفعلي المعروض، والتقاطها خلال فترة زمنية معقولة.',
            'قد تتضمن العلامات المائية اسم المكتب أو المعلن لكن دون أن تحجب ميزات العقار الرئيسية.',
            'يجب أن تكون مقاطع الفيديو ذات صلة بالعقار المدرج ولا تحتوي على محتوى غير لائق.',
            'لا تتضمن معلومات اتصال شخصية أو رموز QR أو روابط خارجية مدمجة على الصور للتحايل على مراسلة المنصة.',
          ],
        },
        {
          id: 'listing-lifecycle',
          title: 'دورة حياة الإعلان وإدارة الحالة',
          paragraphs: [
            'يجب على المعلنين الحفاظ على حالة الإعلان محدّثة. يجب تحديد العقارات المباعة أو المؤجرة أو المسحوبة وفقاً لذلك أو إزالتها من المنصة فوراً.',
          ],
          ordered: [
            'مسودة: إعلانات محفوظة غير ظاهرة للجمهور بعد.',
            'منشور: إعلانات نشطة ظاهرة في نتائج البحث والسوق.',
            'مباع/مؤجر: إعلانات مُعلَّمة كغير متاحة، وتُحفظ للسجلات لكنها مستبعدة من البحث النشط.',
            'محذوف: إعلانات deleted أو removed من المعلن أو moderation المنصة.',
          ],
          callout: {
            title: 'الدقة مهمة',
            body: 'الإعلانات القديمة أو غير المتاحة تُضعف تجربة الباحثين وقد تؤدي إلى عقوبات لحساب الإعلان. نراقب حداثة الإعلانات وقد نؤرشف تلقائياً الإعلانات غير النشطة لفترات طويلة.',
          },
        },
        {
          id: 'office-vs-individual',
          title: 'إعلانات المكاتب مقابل المعلنين الأفراد',
          paragraphs: [
            'يمكن للمكاتb العقارية المعتمدة نشر إعلانات نيابة عن العملاء ويجب الإشارة بوضوح عندما يُدرج العقار من ممثل مكتب مفوض. يمكن للمعلنين الأفراد نشر إعلانات للعقارات يمتلكونها أو لديهم تفويض صريح للإعلان عنها.',
            'يجب ألا تنشر المكاتب إعلانات نيابة عن أطراف ثالثة غير موثقة دون مستندات مناسبة. يجب على المعلنين الأفراد إكمال التحقق من الهوية قبل نشر أول إعلان.',
          ],
        },
        {
          id: 'enforcement',
          title: 'الإنفاذ والاستئناف',
          paragraphs: [
            'يمكن للمستخدمين الإبلاغ عن إعلانات تبدو تنتهك هذه السياسة عبر ميزة الإبلاغ في كل صفحة إعلان. يحقق فريق الإشراف في البلاغات ويتخذ الإجراء المناسب.',
            'إذا أُزيل إعلانك أو قُيِّد حسابك، يمكنك استئناف القرار بالتواصل مع الدعم مع مستندات ذات صلة. نراجع الاستئنافات على أساس كل حالة.',
          ],
        },
      ],
    },
  },

  'data-protection': {
    en: {
      title: 'Data Protection Policy',
      subtitle:
        'Our commitment to protecting personal and business data collected from users, verified offices, and individual listers on Yemen Real Estate.',
      lastUpdated: 'September 2025',
      intro: [
        'Yemen Real Estate takes data protection seriously. This policy describes the principles, practices, and organizational measures we apply to safeguard personal and business information processed through our platform.',
        'This policy applies to all data subjects whose information we process, including property seekers, registered users, verified real estate offices, individual listers, and visitors who interact with our website and applications.',
        'We process personal data lawfully, fairly, and transparently, and only for specified purposes aligned with operating our real estate marketplace services.',
      ],
      sections: [
        {
          id: 'data-principles',
          title: 'Data Protection Principles',
          bullets: [
            'Lawfulness and fairness: We process data based on legitimate grounds including user consent, contractual necessity, and legal obligations.',
            'Purpose limitation: Data is collected for specific, explicit purposes and not used in ways incompatible with those purposes.',
            'Data minimization: We collect only the information necessary to provide and improve our services.',
            'Accuracy: We take reasonable steps to ensure personal data is accurate and kept up to date.',
            'Storage limitation: Data is retained only as long as necessary for the purposes for which it was collected.',
            'Integrity and confidentiality: We implement appropriate security measures to protect data against unauthorized processing.',
          ],
        },
        {
          id: 'lawful-basis',
          title: 'Lawful Basis for Processing',
          paragraphs: [
            'We rely on the following lawful bases to process personal data on Yemen Real Estate:',
          ],
          bullets: [
            'Contractual necessity: Processing required to create and manage user accounts, publish listings, and facilitate messaging between parties.',
            'Consent: Where you have given explicit consent, such as for marketing communications or optional analytics cookies.',
            'Legitimate interests: Processing necessary for fraud prevention, platform security, service improvement, and ensuring marketplace integrity.',
            'Legal obligation: Processing required to comply with applicable laws, regulatory requests, or court orders.',
          ],
        },
        {
          id: 'special-categories',
          title: 'Verification Documents and Sensitive Data',
          paragraphs: [
            'During the verification process, real estate offices and individual listers may submit business licenses, identity documents, and other credentials. We treat this information with heightened care and restrict access to authorized personnel involved in the verification workflow.',
            'Verification documents are stored securely, encrypted in transit and at rest where technically feasible, and are not displayed publicly on the platform. Documents are retained only for as long as necessary to maintain verification status and comply with audit requirements.',
          ],
        },
        {
          id: 'international-transfers',
          title: 'Data Hosting and Transfers',
          paragraphs: [
            'Yemen Real Estate primarily processes and stores data on secure infrastructure selected to provide reliable service to users in Yemen and the region. Where data is transferred to service providers in other jurisdictions, we ensure appropriate safeguards are in place, including contractual data protection clauses.',
            'We do not transfer personal data to jurisdictions without adequate protection unless required by law or with your explicit consent.',
          ],
        },
        {
          id: 'data-subject-rights',
          title: 'Data Subject Rights',
          bullets: [
            'Right of access: Request confirmation of whether we process your data and obtain a copy of that data.',
            'Right to rectification: Request correction of inaccurate or incomplete personal data.',
            'Right to erasure: Request deletion of your data where there is no compelling reason for continued processing.',
            'Right to restrict processing: Request limitation of processing in certain circumstances.',
            'Right to object: Object to processing based on legitimate interests, including profiling for direct marketing.',
            'Right to withdraw consent: Where processing is based on consent, you may withdraw it at any time without affecting prior lawful processing.',
          ],
          callout: {
            title: 'Exercising Your Rights',
            body: 'To submit a data subject request, contact us through the support channels on our Contact page. We may need to verify your identity before processing requests. We aim to respond within 30 days.',
          },
        },
        {
          id: 'breach-notification',
          title: 'Data Breach Response',
          paragraphs: [
            'In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify affected users and relevant authorities as required by applicable law without undue delay.',
            'Our incident response procedures include containment, assessment, notification, and remediation steps designed to minimize harm and prevent recurrence.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة حماية البيانات',
      subtitle:
        'التزامنا بحماية البيانات الشخصية والتجارية المجمعة من المستخدمين والمكاتب المعتمدة والمعلنين الأفراد على عقارات اليمن.',
      lastUpdated: 'September 2025',
      intro: [
        'تأخذ عقارات اليمن حماية البيانات على محمل الجد. تصف هذه السياسة المبادئ والممارسات والإجراءات التنظيمية التي نطبق لحماية المعلومات الشخصية والتجارية المعالجة عبر منصتنا.',
        'تنطبق هذه السياسة على جميع أصحاب البيانات الذين نعالج معلوماتهم، بما في ذلك الباحثين عن العقارات والمستخدمين المسجلين والمكاتب العقارية المعتمدة والمعلنين الأفراد والزوار الذين يتفاعلون مع موقعنا وتطبيقاتنا.',
        'نعالج البيانات الشخصية بشكل قانوني وعادل وشفاف، وفقط لأغراض محددة تتماشى مع تشغيل خدمات سوقنا العقاري.',
      ],
      sections: [
        {
          id: 'data-principles',
          title: 'مبادئ حماية البيانات',
          bullets: [
            'القانونية والعدالة: نعالج البيانات بناءً على أسس مشروعة تشمل موافقة المستخدم والضرورة التعاقدية والالتزامات القانونية.',
            'تحديد الغرض: تُجمع البيانات لأغراض محددة وصريحة ولا تُستخدم بطرق لا تتوافق مع تلك الأغراض.',
            'تقليل البيانات: نجمع فقط المعلومات اللازمة لتقديم خدماتنا وتحسينها.',
            'الدقة: نتخذ خطوات معقولة لضمان دقة البيانات وتحديثها.',
            'تحديد التخزين: تُحفظ البيانات طالما كان ذلك ضرورياً للأغراض التي جُمعت من أجلها.',
            'السلامة والسرية: نطبق إجراءات أمنية مناسبة لحماية البيانات من المعالجة غير المصرح بها.',
          ],
        },
        {
          id: 'lawful-basis',
          title: 'الأساس القانوني للمعالجة',
          paragraphs: [
            'نعتمد على الأسس القانونية التالية لمعالجة البيانات الشخصية على عقارات اليمن:',
          ],
          bullets: [
            'الضرورة التعاقدية: المعالجة اللازمة لإنشاء وإدارة الحسابات ونشر الإعلانات وتسهيل المراسلة.',
            'الموافقة: حيث أعطيت موافقة صريحة، مثل اتصالات التسويق أو ملفات تعريف الارتباط التحليلية الاختيارية.',
            'المصلحة المشروعة: المعالجة اللازمة لمنع الاحتيال وأمن المنصة وتحسين الخدمة ونزاهة السوق.',
            'الالتزام القانوني: المعالجة اللازمة للامتثال للقوانين المعمول بها أو الطلبات التنظيمية أو الأوامر القضائية.',
          ],
        },
        {
          id: 'special-categories',
          title: 'مستندات التحقق والبيانات الحساسة',
          paragraphs: [
            'خلال التحقق، قد تقدم المكاتب والمعلنين الأفراد تراخيص تجارية ومستندات هوية واعتمادات أخرى. نعامل هذه المعلومات بعناية فائقة ونقيّد الوصول للموظفين المخولين في سير عمل التحقق.',
            'تُخزَّن مستندات التحقق بشكل آمن، ومشفرة أثناء النقل والتخزين حيثما أمكن تقنياً، ولا تُعرض علناً. تُحفظ فقط طالما كان ذلك ضرورياً للحفاظ على حالة التحقق والامتثال لمتطلبات التدقيق.',
          ],
        },
        {
          id: 'international-transfers',
          title: 'استضافة البيانات والنقل',
          paragraphs: [
            'تعالج عقارات اليمن وتخزن البيانات على بنية تحتية آمنة مختارة لتقديم خدمة موثوقة للمستخدمين في اليمن والمنطقة. حيث تُنقل البيانات إلى مزودين في ولايات قضائية أخرى، نضمن وجود ضمانات مناسبة.',
            'لا ننقل البيانات الشخصية إلى ولايات قضائية دون حماية كافية إلا إذا تطلب القانون ذلك أو بموافقتك الصريحة.',
          ],
        },
        {
          id: 'data-subject-rights',
          title: 'حقوق صاحب البيانات',
          bullets: [
            'حق الوصول: طلب تأكيد ما إذا كنا نعالج بياناتك والحصول على نسخة.',
            'حق التصحيح: طلب تصحيح البيانات غير الدقيقة أو غير المكتملة.',
            'حق المحو: طلب الحذف حيث لا يوجد سبب مقنع للمعالجة المستمرة.',
            'حق تقييد المعالجة: طلب تحديد المعالجة في ظروف معينة.',
            'حق الاعتراض: الاعتراض على المعالجة بناءً على مصالح مشروعة.',
            'حق سحب الموافقة: حيث تعتمد المعالجة على الموافقة، يمكن سحبها في أي وقت.',
          ],
          callout: {
            title: 'ممارسة حقوقك',
            body: 'لتقديم طلب بخصوص بياناتك، تواصل معنا عبر قنوات الدعم في صفحة اتصل بنا. قد نحتاج للتحقق من هويتك. نهدف للرد خلال 30 يوماً.',
          },
        },
        {
          id: 'breach-notification',
          title: 'الاستجابة لخرق البيانات',
          paragraphs: [
            'في حال خرق للبيانات الشخصية يشكل خطراً على حقوقك، سنُبلغ المستخدمين المتضررين والجهات المعنية كما يقتضي القانون دون تأخير غير مبرر.',
            'تتضمن إجراءات الاستجابة للحوادث احتواءً وتقييماً وإشعاراً ومعالجةً لاحقة لتقليل الضرر ومنع التكرار.',
          ],
        },
      ],
    },
  },

  verification: {
    en: {
      title: 'Verification Policy',
      subtitle:
        'How Yemen Real Estate verifies real estate offices and individual listers to maintain trust and quality across our property marketplace.',
      lastUpdated: 'September 2025',
      intro: [
        'Trust is fundamental to Yemen Real Estate. Our verification program helps property seekers identify legitimate real estate offices and individual listers who have submitted documentation for review and meet our platform standards.',
        'Verification is not an endorsement of any specific property, transaction, or business outcome. It indicates that we have reviewed submitted credentials and found them consistent with the information provided on the platform.',
        'This policy explains the verification process for real estate offices and individual listers, the documentation required, and the conditions under which verified status may be granted, suspended, or revoked.',
      ],
      sections: [
        {
          id: 'office-verification',
          title: 'Real Estate Office Verification',
          paragraphs: [
            'Real estate offices operating on Yemen Real Estate may apply for verified status by submitting business documentation through the office registration workflow. Our team reviews applications to confirm the legitimacy of the business.',
          ],
          bullets: [
            'Valid business license or commercial registration demonstrating authorization to operate as a real estate office.',
            'Official business name matching the name displayed on the platform profile.',
            'Contact information for an authorized representative, including verifiable phone number and business address.',
            'Proof of physical office location within Yemen where applicable.',
            'Any additional documentation requested by our verification team to resolve discrepancies.',
          ],
          ordered: [
            'Submit office registration application with required business details.',
            'Upload verification documents through the رفع آمن عبر لوحة التحكم feature.',
            'Our team reviews the application, typically within 3–5 business days.',
            'If approved, the office profile displays a verified badge and may publish listings under the office account.',
            'If additional information is needed, the applicant is notified and given an opportunity to resubmit.',
          ],
        },
        {
          id: 'individual-lister-verification',
          title: 'Individual Lister Verification',
          paragraphs: [
            'Individual listers who wish to publish property listings on Yemen Real Estate must complete identity verification before their first listing goes live. This helps protect the marketplace from fraudulent listings posted by unauthorized parties.',
          ],
          bullets: [
            'Government-issued photo identification confirming the lister\'s identity.',
            'Proof of property ownership or written authorization from the property owner to advertise the listing.',
            'A verifiable phone number linked to the account.',
            'Accurate personal profile information consistent with submitted identification documents.',
          ],
        },
        {
          id: 'verified-badge',
          title: 'What Verification Means',
          paragraphs: [
            'A verified badge on an office profile or individual lister account indicates that Yemen Real Estate has completed a documentation review at the time of verification. It does not guarantee the accuracy of every listing, the outcome of any transaction, or the ongoing compliance of the verified party.',
          ],
          callout: {
            title: 'Verification Is Not a Guarantee',
            body: 'Property seekers should always conduct their own due diligence, including visiting properties in person, verifying ownership documents, and consulting qualified legal professionals before entering into any purchase or rental agreement.',
          },
        },
        {
          id: 'suspension-and-revocation',
          title: 'Suspension and Revocation of Verified Status',
          bullets: [
            'Submission of forged, altered, or expired documentation during verification or re-verification.',
            'Multiple substantiated user reports of fraudulent listings, misrepresentation, or failure to honor inquiries.',
            'Failure to maintain accurate office or profile information after verification.',
            'Violation of our Terms of Service, Listing Policy, or Messaging Policy.',
            'Legal or regulatory action affecting the office\'s or lister\'s ability to operate.',
          ],
          paragraphs: [
            'When verified status is suspended or revoked, the affected account may lose the ability to publish new listings, and existing listings may be hidden pending review. The account holder is notified of the action and may appeal through our support channels.',
          ],
        },
        {
          id: 're-verification',
          title: 'Periodic Re-Verification',
          paragraphs: [
            'We may require verified offices and listers to periodically update their documentation to ensure continued compliance with platform standards. Re-verification requests are communicated through the account dashboard and must be completed within the specified timeframe to avoid interruption of verified status.',
          ],
        },
        {
          id: 'appeals',
          title: 'Appeals Process',
          paragraphs: [
            'If your verification application is rejected or your verified status is revoked, you may submit an appeal by contacting support with additional documentation or clarification. Appeals are reviewed by a member of our verification team who was not involved in the original decision where possible.',
            'We aim to resolve appeals within 10 business days. Decisions on appeals are final unless new material evidence is provided.',
          ],
        },
      ],
    },
    ar: {
      title: 'سياسة التحقق',
      subtitle:
        'كيف تتحقق عقارات اليمن من المكاتب العقارية والمعلنين الأفراد للحفاظ على الثقة والجودة في سوقنا العقاري.',
      lastUpdated: 'September 2025',
      intro: [
        'الثقة أساسية في عقارات اليمن. يساعد برنامج التحقق لدينا الباحثين عن العقارات على التعرف على المكاتب العقارية والمعلنين الأفراد الموثوقين الذين قدموا مستندات للمراجعة ويستوفون معايير منصتنا.',
        'التحقق ليس تأييداً لأي عقار أو معاملة أو نتيجة تجارية محددة. يدل على أننا راجعنا الاعتمادات المقدمة ووجدناها متسقة مع المعلومات المعروضة على المنصة.',
        'توضح هذه السياسة عملية التحقق للمكاتب والمعلنين الأفراد والمستندات المطلوبة والشروط التي قد تُمنح أو تُعلَّق أو تُلغى فيها حالة التحقق.',
      ],
      sections: [
        {
          id: 'office-verification',
          title: 'التحقق من المكاتب العقارية',
          paragraphs: [
            'يمكن للمكاتb العقارية العاملة على عقارات اليمن التقدم للحصول على حالة التحقق بتقديم مستندات تجارية عبر سير عمل تسجيل المكتب. يراجع فريقنا الطلبات لتأكيد شرعية النشاط.',
          ],
          bullets: [
            'ترخيص تجاري أو سجل تجاري ساري يثبت الترخيص للعمل كمكتب عقاري.',
            'اسم تجاري رسمي يطابق الاسم المعروض على ملف المنصة.',
            'معلومات اتصال لممثل مفوض، بما في ذلك رقم هاتف قابل للتحقق وعنوان تجاري.',
            'إثبات لموقع مكتب فعلي داخل اليمن حيث ينطبق.',
            'أي مستندات إضافية يطلبها فريق التحقق لحل التناقضات.',
          ],
          ordered: [
            'تقديم طلب تسجيل المكتب مع بيانات العمل المطلوبة.',
            'رفع مستندات التحقق بشكل آمن عبر لوحة التحكم.',
            'يراجع فريقنا الطلب، عادةً خلال 3–5 أيام عمل.',
            'إذا تمت الموافقة، يعرض ملف المكتب شارة التحقق ويمكنه نشر إعلانات تحت حساب المكتب.',
            'إذا لزمت معلومات إضافية، يُبلغ مقدم الطلب ويُمنح فرصة لإعادة التقديم.',
          ],
        },
        {
          id: 'individual-lister-verification',
          title: 'التحقق من المعلنين الأفراد',
          paragraphs: [
            'المعلنون الأفراد الراغبين في نشر إعلانات على عقارات اليمن يجب إكمال التحقق من الهوية قبل نشر أول إعلان. يساعد هذا حماية السوق من إعلانات احتيالية ينشرها أطراف غير مخولين.',
          ],
          bullets: [
            'بطاقة هوية أو جواز سفر صادر من جهة حكومية يؤكد هوية المعلن.',
            'إثبات ملكية العقار أو تفويضاً خطياً من المالك للإعلان عنه.',
            'رقم هاتف قابل للتحقق مرتبط للحساب.',
            'معلومات ملف شخصي دقيق متسق مع مستندات الهوية المقدمة.',
          ],
        },
        {
          id: 'verified-badge',
          title: 'ماذا يعني التحقق',
          paragraphs: [
            'شارة التحقق على ملف مكتب أو حساب معلن فرد تشير إلى أن عقارات اليمن أكملت مراجعة المستندات وقت التحقق. لا تضمن دقة كل إعلان أو نتيجة أي معاملة أو الالتزام المستمر للطرف الموثق.',
          ],
          callout: {
            title: 'التحقق ليس ضماناً',
            body: 'يجب على الباحثين عن العقارات دائماً إجراء العناية الواجبة الخاصة بهم، بما في ذلك زيارة العقارات شخصياً والتحقق من مستندات الملكية واستشارة متخصصين قانونيين مؤهلين قبل أي اتفاق شراء أو إيجار.',
          },
        },
        {
          id: 'suspension-and-revocation',
          title: 'تعليق وإلغاء حالة التحقق',
          bullets: [
            'تقديم مستندات مزورة أو معدلة أو منتهية الصلاحية أثناء التحقق أو إعادة التحقق.',
            'بلاغات متعددة مثبتة من المستخدمين لإعلانات احتيالية أو تضليل أو إخفاق في الرد على استفسارات.',
            'الإخفاق في الحفاظ على معلومات المكتب أو الملف الشخصي دقيقة بعد التحقق.',
            'انتهاك شروط الخدمة أو سياسة الإعلانات أو سياسة المراسلة.',
            'إجراء قانوني أو تنظيمي يؤثر على قدرة المكتب أو المعلن على العمل.',
          ],
          paragraphs: [
            'عند تعليق أو إلغاء حالة التحقق، قد يفقد الحساب المتأثر القدرة على نشر إعلانات جديدة، وقد تُخفى الإعلانات الحالية بانتظار المراجعة. يُبلغ صاحب الحساب ويمكنه الاستئناف عبر قنوات الدعم.',
          ],
        },
        {
          id: 're-verification',
          title: 'إعادة التحقق الدورية',
          paragraphs: [
            'قد نطلب من المكاتب والمعلنين الموثقين تحديث مستنداتهم دورياً لضمان الالتزام المستمر. تُبلَّغ طلبات إعادة التحقق عبر لوحة التحكم ويجب إكمالها خلال المدة المحددة لتجنب انقطاع حالة التحقق.',
          ],
        },
        {
          id: 'appeals',
          title: 'عملية الاستئناف',
          paragraphs: [
            'إذا رُفض طلب التحقق أو أُلغيت حالة التحقق، يمكن تقديم استئناف بالتواصل مع الدعم مع مستندات إضافية. يراجع الاستئناف عضو في فريق التحقق لم يشارك في القرار الأصلي حيثما أمكن.',
            'نهدف إلى حل الاستئنافات خلال 10 أيام عمل. قرارات الاستئناف نهائية ما لم تُقدَّم أدلة جديدة جوهرية.',
          ],
        },
      ],
    },
  },
};

export function getLegalDocument(id: LegalDocumentId, locale: string): LegalDocument {
  const normalizedLocale: Locale = locale === 'ar' ? 'ar' : 'en';
  return LEGAL_DOCUMENTS[id][normalizedLocale];
}
