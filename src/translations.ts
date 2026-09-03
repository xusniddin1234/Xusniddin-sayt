export const t = {
  appName: 'XUSNIDDIN.DEV',
  appTagline: 'Zamonaviy texnologiyalar, dasturlash va shaxsiy blog platformasi',
  nav: {
    home: 'Bosh sahifa',
    news: 'Barcha yangiliklar',
    categories: 'Kategoriyalar',
    about: 'Muallif haqida',
    search: 'Qidiruv',
    admin: 'Admin panel',
    login: 'Kirish',
    logout: 'Chiqish',
  },
  hero: {
    badge: 'Muhim yangilik',
    readArticle: 'Maqolani o‘qish',
    minRead: 'daqiqa mutolaa',
  },
  home: {
    latestNews: 'So‘nggi yangiliklar',
    latestSubtitle: 'Dasturlash, texnologiya va ilm-fan olamidagi eng yangi xabarlar',
    featuredNews: 'Tanlangan maqolalar',
    allCategories: 'Mavzular',
    noPosts: 'Hozircha hech qanday maqola topilmadi.',
    viewAll: 'Barchasini ko‘rish',
    views: 'marta ko‘rilgan',
    published: 'Chop etilgan',
  },
  article: {
    backToHome: 'Bosh sahifaga qaytish',
    share: 'Ulashish',
    copied: 'Havola nusxalandi!',
    copyLink: 'Havolani nusxalash',
    relatedTitle: 'Mavzuga doir maqolalar',
    author: 'Muallif',
  },
  search: {
    placeholder: 'Sarlavha, mavzu yoki kalit so‘z bo‘yicha qidiring...',
    searching: 'Qidirilmoqda...',
    resultsFound: 'ta natija topildi',
    noResults: 'Hech narsa topilmadi. Boshqa kalit so‘z kiritib ko‘ring.',
    clear: 'Tozalash',
  },
  admin: {
    title: 'Boshqaruv paneli',
    welcome: 'Xush kelibsiz, Admin!',
    totalPosts: 'Jami maqolalar',
    publishedPosts: 'Chop etilgan',
    drafts: 'Qoralamalar',
    categories: 'Kategoriyalar',
    totalViews: 'Jami ko‘rishlar',
    newPost: 'Yangi maqola yaratish',
    manageCategories: 'Kategoriyalarni boshqarish',
    statusPublished: 'Chop etilgan',
    statusDraft: 'Qoralama',
    actions: 'Amallar',
    edit: 'Tahrirlash',
    delete: 'O‘chirish',
    preview: 'Ko‘rib chiqish',
    save: 'Saqlash',
    publish: 'Chop etish',
    saveDraft: 'Qoralama sifatida saqlash',
    deleteConfirmTitle: 'Maqolani o‘chirishni tasdiqlaysizmi?',
    deleteConfirmText: 'Ushbu amalni ortga qaytarib bo‘lmaydi. Maqola maʼlumotlar bazasidan butunlay o‘chiriladi.',
    cancel: 'Bekor qilish',
  },
};

export function formatDateUz(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const monthsUz = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ];

  const day = date.getDate();
  const month = monthsUz[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}, ${year}`;
}
