// Site content: built-in defaults, Supabase loading and validation.
// Shared by the public site (main.js) and the admin panel (js/admin.js).
//
// Content lives in public.site_content as one JSON document per section
// (hero, packages, roi, contact). Anything missing or malformed falls back
// to the defaults below, so the site always renders.
(function () {
  'use strict';

  // ---------- defaults (mirror the static HTML) ----------

  const DEFAULTS = {
    hero: {
      tag: 'บริการ EPC โซลาร์เซลล์แบบ Turnkey ทั่วประเทศ',
      lines: ['เปลี่ยนหลังคา', 'ให้เป็นโรงไฟฟ้า', 'ที่คืนทุนได้จริง'],
      subtitle: 'ผู้นำด้านพลังงานแสงอาทิตย์ครบวงจร ด้วยเทคโนโลยีระดับโลก SolarEdge & Q CELLS',
      ctaPrimary: 'คำนวณความคุ้มค่า',
      ctaSecondary: 'ดูแพ็กเกจ',
      videoUrl: 'Media/hero.mp4',
      posterUrl: 'Media/hero-poster.jpg',
    },

    packages: {
      home: {
        note: 'ราคารวมติดตั้งบนหลังคาเมทัลชีตหรือกระเบื้องลอนคู่ ราคาสำหรับหลังคาประเภทอื่นวิศวกรจะประเมินหลังสำรวจหน้างาน',
        items: [
          { name: 'ชุดบ้าน 5 kWp', kwp: 5, badge: 'ออนกริด 1 เฟส', t: 2.2, slot: 'home-5kwp', image: '',
            fit: 'บ้านที่ค่าไฟ 3,000–5,000 บาทต่อเดือน มีคนอยู่บ้านช่วงกลางวัน',
            specs: [['แผง N-type 580W', '9 แผง'], ['ผลิตไฟเฉลี่ย', '550 หน่วย/เดือน'], ['ประหยัดได้', '~2,300 บาท/เดือน'], ['รับประกันแผง', '30 ปี']],
            price: 159000 },
          { name: 'ชุดบ้านไฮบริด 10 kWp', kwp: 10, badge: 'ไฮบริด + แบตเตอรี่ 10 kWh', t: 5, slot: 'home-hybrid-10kwp', image: '',
            fit: 'บ้านที่ใช้ไฟช่วงเย็นถึงกลางคืนสูง หรืออยู่ในพื้นที่ไฟตกบ่อย',
            specs: [['แผง N-type 580W', '18 แผง'], ['ผลิตไฟเฉลี่ย', '1,100 หน่วย/เดือน'], ['ประหยัดได้', '~4,600 บาท/เดือน'], ['รับประกันแบตเตอรี่', '10 ปี']],
            price: 389000 },
          { name: 'ชุดธุรกิจ 30 kWp', kwp: 30, badge: 'ออนกริด 3 เฟส', t: 8.2, slot: 'business-30kwp', image: '',
            fit: 'ร้านค้า คลินิก และสำนักงานที่เปิดทำการช่วงกลางวัน',
            specs: [['แผง N-type 580W', '52 แผง'], ['ผลิตไฟเฉลี่ย', '3,300 หน่วย/เดือน'], ['ประหยัดได้', '~13,900 บาท/เดือน'], ['รับประกันอินเวอร์เตอร์', '10 ปี']],
            price: 690000 },
        ],
      },
      factory: {
        note: 'สำหรับระบบตั้งแต่ 500 kWp ขึ้นไป มีทางเลือกสัญญาซื้อขายไฟ (PPA) ที่ไม่ต้องลงทุนเอง โดยจ่ายเฉพาะค่าไฟในอัตราที่ต่ำกว่าการไฟฟ้า',
        items: [
          { name: 'ชุดโรงงาน 100 kWp', kwp: 100, badge: 'ออนกริด 3 เฟส', t: 1.2, slot: 'factory-100kwp', image: '',
            fit: 'โรงงานขนาดเล็กและโกดังสินค้าที่เดินเครื่องช่วงกลางวัน',
            specs: [['แผง N-type 580W', '172 แผง'], ['ผลิตไฟเฉลี่ย', '11,000 หน่วย/เดือน'], ['ประหยัดได้', '~48,400 บาท/เดือน'], ['คืนทุนประมาณ', '3.5 ปี']],
            price: 2050000 },
          { name: 'ชุดโรงงาน 300 kWp', kwp: 300, badge: 'ออนกริด พร้อมระบบกันย้อน', t: 4.2, slot: 'factory-300kwp', image: '',
            fit: 'โรงงานที่ใช้ไฟต่อเนื่องสองกะ และอาคารพาณิชย์ขนาดกลาง',
            specs: [['แผง N-type 580W', '518 แผง'], ['ผลิตไฟเฉลี่ย', '33,000 หน่วย/เดือน'], ['ประหยัดได้', '~145,000 บาท/เดือน'], ['คืนทุนประมาณ', '3.2 ปี']],
            price: 5550000 },
          { name: 'ชุดโรงงาน 1 MWp', kwp: 1000, badge: 'ลงทุนเองหรือ PPA', t: 7.4, slot: 'factory-1mwp', image: '',
            fit: 'นิคมอุตสาหกรรมและโรงงานขนาดใหญ่ที่ต้องการลดคาร์บอนตามเป้าองค์กร',
            specs: [['แผง N-type 580W', '1,724 แผง'], ['ผลิตไฟเฉลี่ย', '110,000 หน่วย/เดือน'], ['ประหยัดได้', '~484,000 บาท/เดือน'], ['ลดคาร์บอน', '~660 ตัน/ปี']],
            price: 16900000 },
        ],
      },
    },

    // Calculator inputs. Thailand averages: ~110 kWh per kWp per month,
    // 0.5%/yr panel degradation. Cost per kWp falls with system size (tiers).
    roi: {
      yield: 110,
      degradation: 0.005,
      home: {
        tariff: 4.2, day: 50,
        bill: { min: 1500, max: 30000, step: 500, value: 4500 },
        round: 0.5, minKw: 3, maxKw: 50,
        tiers: [{ upTo: 5, perKw: 32000 }, { upTo: 10, perKw: 28000 }, { upTo: 20, perKw: 25000 }, { upTo: null, perKw: 23000 }],
      },
      factory: {
        tariff: 4.4, day: 70,
        bill: { min: 30000, max: 2000000, step: 10000, value: 250000 },
        round: 5, minKw: 30, maxKw: 1000,
        tiers: [{ upTo: 100, perKw: 21000 }, { upTo: 300, perKw: 19000 }, { upTo: 600, perKw: 18000 }, { upTo: null, perKw: 17000 }],
      },
    },

    // From the company profile (Solar1energy co.,ltd, 2026). phone may hold several
    // numbers separated by commas; the first one is the call button's number.
    contact: {
      addressLines: ['บริษัท โซล่าร์ 1 เอ็นเนอร์ยี่ จำกัด', '81/22 หมู่ 2 ต.บางเตย อ.สามพราน', 'จ.นครปฐม 73210', 'ใกล้ห้างเซ็นทรัลศาลายา', 'ให้บริการติดตั้งทั่วประเทศ'],
      phone: '082-416-9619, 098-453-3655',
      email: 'solar1.ceo@gmail.com',
      hours: 'จันทร์ - เสาร์: 08:00 - 17:00 น.',
      lineId: '@519qvafb',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: 'https://www.tiktok.com/@solar1.ceo',
    },

    // About-us figures and the installation portfolio, from the company profile.
    // kw is the system size in kW; saving is the reduction in baht per month
    // (savingUpTo: the profile gives a range, shown as "up to" its top figure);
    // year is the Buddhist-era year the installation was completed (0 = not stated).
    projects: {
      stats: [
        { value: 10, small: '+ ปี', label: 'ประสบการณ์ของทีมสถาปนิกและวิศวกร' },
        { value: 100, small: '+', label: 'บ้านพักอาศัยที่ติดตั้งระบบแล้ว' },
        { value: 3.5, small: 'MW', label: 'ระบบที่ใหญ่ที่สุดของเรา ติดตั้งให้ KVS Fresh Products' },
        { value: 1.75, small: 'ล้านบาท', label: 'ค่าไฟที่ระบบนี้ช่วยลดได้ในแต่ละเดือน' },
      ],
      items: [
        { name: 'บริษัท เควีเอส เฟรชโปรดักส์ จำกัด', category: 'industry', location: 'เก้าเลี้ยว, นครสวรรค์', kw: 3500, saving: 1750000, savingUpTo: false, year: 2568, image: 'Media/projects/kvs-fresh-products-3-5mw.webp', featured: true },
        { name: 'บริษัท เควีเอส เฟรชโปรดักส์ จำกัด', category: 'industry', location: 'เก้าเลี้ยว, นครสวรรค์', kw: 1000, saving: 500000, savingUpTo: false, year: 2568, image: 'Media/projects/kvs-fresh-products-1mw.webp' },
        { name: 'บริษัท ศรีสุดาฟาร์ม จำกัด', category: 'industry', location: 'เมืองนครสวรรค์, นครสวรรค์', kw: 1000, saving: 500000, savingUpTo: false, year: 2568, image: 'Media/projects/srisuda-farm-1mw.webp' },
        { name: 'บริษัท เคลฟเวอร์ กู๊ดส์ จำกัด', category: 'industry', location: 'เก้าเลี้ยว, นครสวรรค์', kw: 500, saving: 250000, savingUpTo: false, year: 2568, image: 'Media/projects/clever-goods-500kw.webp' },
        { name: 'บริษัท คิว ซี เอฟ จำกัด (ฟาร์มหนองหงษ์)', category: 'industry', location: 'พนัสนิคม, ชลบุรี', kw: 200, saving: 100000, savingUpTo: false, year: 2564, image: 'Media/projects/qcf-nong-hong-200kw.webp' },
        { name: 'บริษัท เกษตรชล 2559 จำกัด', category: 'industry', location: 'บ่อทอง, ชลบุรี', kw: 143.52, saving: 70000, savingUpTo: false, year: 2564, image: 'Media/projects/kasetchon-2559-143kw.webp' },
        { name: 'บริษัท ไทยซัพพลาย เทรดดิ้ง จำกัด', category: 'industry', location: 'ปากช่อง, นครราชสีมา', kw: 110, saving: 50000, savingUpTo: false, year: 2565, image: 'Media/projects/thai-supply-trading-110kw.webp' },
        { name: 'บริษัท บิ๊ก ฟู้ดส์ กรุ๊ป จำกัด', category: 'industry', location: 'เมืองราชบุรี, ราชบุรี', kw: 100, saving: 50000, savingUpTo: false, year: 2567, image: 'Media/projects/big-food-group-100kw.webp' },
        { name: 'โรงเรียนศรีเทพบาล', category: 'business', location: 'จัตุรัส, ชัยภูมิ', kw: 70.5, saving: 42000, savingUpTo: true, year: 2564, image: 'Media/projects/sri-thep-ban-school-70kw.webp' },
        { name: 'บริษัท กนกวรรณฟาร์ม จำกัด', category: 'industry', location: 'บรรพตพิสัย, นครสวรรค์', kw: 70.06, saving: 42000, savingUpTo: true, year: 2566, image: 'Media/projects/kanokwan-farm-70kw.webp' },
        { name: 'บริษัท ปากช่อง-ธีระบริการ', category: 'business', location: 'ปากช่อง, นครราชสีมา', kw: 60.06, saving: 36000, savingUpTo: true, year: 2565, image: 'Media/projects/pakchong-theera-60kw.webp' },
        { name: 'The Next Plaza', category: 'business', location: 'ปลวกแดง, ระยอง', kw: 50, saving: 30000, savingUpTo: false, year: 2565, image: 'Media/projects/the-next-plaza-50kw.webp' },
        { name: 'นิวเชโก้ ห้องแถวให้เช่า', category: 'business', location: 'ปลวกแดง, ระยอง', kw: 50, saving: 30000, savingUpTo: false, year: 2565, image: 'Media/projects/newchaco-rental-50kw.webp' },
        { name: 'อพาร์ทเม้นท์ เจเอส เมนชั่น', category: 'business', location: 'บางซื่อ, กรุงเทพฯ', kw: 30.4, saving: 18000, savingUpTo: false, year: 2566, image: 'Media/projects/js-mansion-30kw.webp' },
        { name: 'บ้านสว่างศิลป์ อพาร์ทเมนท์', category: 'business', location: 'สุขสวัสดิ์, สมุทรปราการ', kw: 30.4, saving: 18000, savingUpTo: false, year: 2566, image: 'Media/projects/baan-sawang-sin-30kw.webp' },
        { name: 'นิมิต โค่ยฟาร์ม', category: 'industry', location: 'ดอนเจดีย์, สุพรรณบุรี', kw: 25.74, saving: 17000, savingUpTo: true, year: 2565, image: 'Media/projects/nimit-koi-farm-25kw.webp' },
        { name: 'อาคารพาณิชย์ ย่านสาธุประดิษฐ์', category: 'business', location: 'สาธุประดิษฐ์, กรุงเทพฯ', kw: 25.03, saving: 15000, savingUpTo: true, year: 2565, image: 'Media/projects/sathupradit-building-25kw.webp' },
        { name: 'บริษัท เอื้ออารี ฟู้ด โปรดักท์ จำกัด', category: 'industry', location: 'เมืองสมุทรสาคร, สมุทรสาคร', kw: 20.25, saving: 12000, savingUpTo: true, year: 2565, image: 'Media/projects/aur-aree-food-20kw.webp' },
        { name: 'โรงงานผลิตและจำหน่ายลูกชิ้นแปรรูป', category: 'industry', location: 'กรุงเทพฯ', kw: 13.2, saving: 7000, savingUpTo: true, year: 0, image: 'Media/projects/meatball-factory-13kw.webp' },
        { name: 'บริษัท เจริญกิจยนต์ จำกัด', category: 'business', location: 'ราชบุรี', kw: 12.15, saving: 7000, savingUpTo: true, year: 0, image: 'Media/projects/charoenkit-yont-12kw.webp' },
        { name: 'โรงแรม Takaki Boutique Hotel', category: 'business', location: 'กรุงเทพฯ', kw: 10, saving: 6000, savingUpTo: false, year: 0, image: 'Media/projects/takaki-boutique-hotel-10kw.webp' },
        { name: 'บริษัท คิว ซี เอฟ จำกัด', category: 'business', location: 'เมืองชลบุรี, ชลบุรี', kw: 10, saving: 6000, savingUpTo: true, year: 2564, image: 'Media/projects/qcf-office-10kw.webp' },
        { name: 'วัดหนองย่ารำ', category: 'business', location: 'ท่าปลา, อุตรดิตถ์', kw: 9.66, saving: 6000, savingUpTo: true, year: 2564, image: 'Media/projects/wat-nong-ya-ram-9kw.webp' },
        { name: 'งอก ฟาร์ม Cafe & Restaurant', category: 'business', location: 'อู่ทอง, สุพรรณบุรี', kw: 9.55, saving: 6000, savingUpTo: true, year: 2564, image: 'Media/projects/ngok-farm-cafe-9kw.webp' },
        { name: 'บริษัท ท็อป แปซิฟิค จำกัด', category: 'business', location: 'บางประกอก, กรุงเทพฯ', kw: 6.83, saving: 3600, savingUpTo: true, year: 2565, image: 'Media/projects/top-pacific-6kw.webp' },
        { name: 'ร้านขายอาหารแห้งและอาหารสด', category: 'business', location: 'บึงสามัคคี, กำแพงเพชร', kw: 6.65, saving: 3700, savingUpTo: true, year: 2566, image: 'Media/projects/grocery-kamphaeng-phet-6kw.webp' },
        { name: 'คลินิกทันตกรรมบ้านหมอรุจน์', category: 'business', location: 'เมืองสุพรรณบุรี, สุพรรณบุรี', kw: 6.37, saving: 3700, savingUpTo: true, year: 2565, image: 'Media/projects/baan-mor-ruj-clinic-6kw.webp' },
        { name: 'ร้านอาหาร เฮียตี๋แหนมเนือง', category: 'business', location: 'เมืองสระบุรี, สระบุรี', kw: 6.37, saving: 3700, savingUpTo: true, year: 2565, image: 'Media/projects/hia-tee-naem-nueang-6kw.webp' },
        { name: 'QTEC & VM Business Intelligence', category: 'business', location: 'ถนนเฉลิมพระเกียรติ ร.9', kw: 6.37, saving: 3700, savingUpTo: true, year: 2565, image: 'Media/projects/qtec-vm-6kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'พหลโยธิน, กรุงเทพฯ', kw: 11.2, saving: 6500, savingUpTo: false, year: 0, image: 'Media/projects/home-phahonyothin-11kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ราชเทวี, กรุงเทพฯ', kw: 10, saving: 6500, savingUpTo: true, year: 2564, image: 'Media/projects/home-ratchathewi-10kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ภูเก็ต', kw: 10, saving: 6000, savingUpTo: false, year: 0, image: 'Media/projects/home-phuket-10kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'เมืองอุดรธานี, อุดรธานี', kw: 9.98, saving: 6000, savingUpTo: false, year: 2566, image: 'Media/projects/home-udon-thani-10kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'คันนายาว, กรุงเทพฯ', kw: 9.95, saving: 6000, savingUpTo: true, year: 2565, image: 'Media/projects/home-khan-na-yao-10kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'กฤษดานคร, นครปฐม', kw: 7.12, saving: 3900, savingUpTo: true, year: 2566, image: 'Media/projects/home-krisda-nakhon-7kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'เมืองปทุมธานี, ปทุมธานี', kw: 7.05, saving: 4000, savingUpTo: true, year: 2564, image: 'Media/projects/home-pathum-thani-7kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ธนบุรี, กรุงเทพฯ', kw: 6.65, saving: 3700, savingUpTo: false, year: 2566, image: 'Media/projects/home-thonburi-6kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'เสาไห้, สระบุรี', kw: 6.44, saving: 3700, savingUpTo: true, year: 2565, image: 'Media/projects/home-sao-hai-6kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ราชพฤกษ์–พระราม 5, นนทบุรี', kw: 5.72, saving: 3000, savingUpTo: false, year: 0, image: 'Media/projects/home-ratchaphruek-rama5-5kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'สวนศรีนครินทร์, กรุงเทพฯ', kw: 5.17, saving: 3000, savingUpTo: false, year: 0, image: 'Media/projects/home-suan-srinakarin-5kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ย่านอุดมสุข', kw: 4.75, saving: 3000, savingUpTo: false, year: 2566, image: 'Media/projects/home-udomsuk-a-4kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ย่านอุดมสุข', kw: 4.75, saving: 3000, savingUpTo: false, year: 2566, image: 'Media/projects/home-udomsuk-b-4kw.webp' },
        { name: 'บ้านพักอาศัย', category: 'home', location: 'ย่านราชพฤกษ์', kw: 4.75, saving: 3000, savingUpTo: false, year: 2566, image: 'Media/projects/home-ratchaphruek-4kw.webp' },
      ],
      clients: [
        { name: 'KVS Fresh Products', logo: 'Media/clients/kvs-fresh-products.webp', w: 188, h: 200 },
        { name: 'Quality Chicken Farm (คิว ซี เอฟ)', logo: 'Media/clients/quality-chicken-farm.webp', w: 278, h: 133 },
        { name: 'Big Food Group (บิ๊ก ฟู้ดส์ กรุ๊ป)', logo: 'Media/clients/big-food-group.webp', w: 202, h: 200 },
        { name: 'เกษตรชล 2559', logo: 'Media/clients/kasetchon-2559.webp', w: 207, h: 200 },
        { name: 'ศรีสุดาฟาร์ม และ กนกวรรณฟาร์ม', logo: 'Media/clients/srisuda-kanokwan-farm.webp', w: 200, h: 200 },
        { name: 'เคลฟเวอร์ กู๊ดส์', logo: 'Media/clients/clever-goods.webp', w: 158, h: 199 },
        { name: 'สถานีบริการ ปตท. ราชบุรี (ในเมือง)', logo: 'Media/clients/ptt-ratchaburi.webp', w: 404, h: 200 },
        { name: 'ไทยซัพพลาย เทรดดิ้ง', logo: 'Media/clients/thai-supply-trading.webp', w: 285, h: 200 },
        { name: 'เอื้ออารี ฟู้ด โปรดักท์', logo: 'Media/clients/aur-aree.webp', w: 231, h: 200 },
      ],
    },
  };

  const SECTIONS = ['hero', 'packages', 'roi', 'contact', 'projects'];
  const PROJECT_CATEGORIES = ['industry', 'business', 'home'];
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ---------- small safety helpers ----------

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  // Accepts https/http URLs and same-site relative paths ("Media/x.jpg").
  // Anything else (javascript:, data:, protocol-relative //host) is rejected.
  function safeUrl(value) {
    const s = String(value ?? '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) {
      try { return new URL(s).href; } catch { return ''; }
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//') || s.includes('\\')) return '';
    return s.replace(/^\/+/, '');
  }

  const str = (v, fallback, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
  const num = (v, fallback, min = -Infinity, max = Infinity) => {
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
    return typeof n === 'number' && Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  };

  // ---------- validation: always returns a complete, well-typed section ----------

  function normalizeHero(d) {
    const def = DEFAULTS.hero;
    d = d && typeof d === 'object' ? d : {};
    let lines = Array.isArray(d.lines) ? d.lines.map((l) => str(l, '', 80)).filter(Boolean) : [];
    if (lines.length > 3) lines = [lines[0], lines[1], lines.slice(2).join(' ')];
    const videoUrl = safeUrl(d.videoUrl) || def.videoUrl;
    return {
      tag: str(d.tag, def.tag, 80),
      lines: lines.length ? lines : clone(def.lines),
      subtitle: str(d.subtitle, def.subtitle, 600),
      ctaPrimary: str(d.ctaPrimary, def.ctaPrimary, 40) || def.ctaPrimary,
      ctaSecondary: str(d.ctaSecondary, def.ctaSecondary, 40) || def.ctaSecondary,
      videoUrl,
      // the bundled poster is a frame of the bundled clip, so it only applies to that clip
      posterUrl: safeUrl(d.posterUrl) || (videoUrl === def.videoUrl ? def.posterUrl : ''),
    };
  }

  function normalizePackage(p, i) {
    p = p && typeof p === 'object' ? p : {};
    const specs = Array.isArray(p.specs)
      ? p.specs.filter((s) => Array.isArray(s) && s.length >= 2)
          .map(([k, v]) => [str(k, '', 60), str(v, '', 60)])
          .filter(([k, v]) => k || v).slice(0, 8)
      : [];
    return {
      name: str(p.name, '', 80) || `แพ็กเกจ ${i + 1}`,
      kwp: num(p.kwp, 0, 0, 100000),
      badge: str(p.badge, '', 60),
      fit: str(p.fit, '', 240),
      specs,
      price: num(p.price, 0, 0, 1e10),
      image: safeUrl(p.image),
      slot: str(p.slot, '', 60).replace(/[^a-z0-9-]/gi, ''),
      t: num(p.t, (i * 2.7) % 9, 0, 600),
    };
  }

  function normalizePackages(d) {
    d = d && typeof d === 'object' ? d : {};
    const out = {};
    for (const seg of ['home', 'factory']) {
      const s = d[seg] && typeof d[seg] === 'object' ? d[seg] : null;
      if (!s) { out[seg] = clone(DEFAULTS.packages[seg]); continue; }
      const items = Array.isArray(s.items) ? s.items.slice(0, 12).map(normalizePackage) : [];
      out[seg] = {
        note: str(s.note, '', 400),
        items: items.length ? items : clone(DEFAULTS.packages[seg].items),
      };
    }
    return out;
  }

  function normalizeProfile(p, def) {
    p = p && typeof p === 'object' ? p : {};
    const b = p.bill && typeof p.bill === 'object' ? p.bill : {};
    const min = num(b.min, def.bill.min, 0, 1e9);
    const max = Math.max(num(b.max, def.bill.max, 0, 1e9), min + 1);
    let tiers = Array.isArray(p.tiers)
      ? p.tiers.map((t) => ({
          upTo: t && t.upTo !== null && t.upTo !== '' && t.upTo !== undefined ? num(t.upTo, null, 0, 1e6) : null,
          perKw: num(t && t.perKw, NaN, 1, 1e7),
        })).filter((t) => Number.isFinite(t.perKw)).slice(0, 8)
      : [];
    // ascending by size, with exactly one open-ended tier last
    tiers = tiers.filter((t) => t.upTo !== null).sort((a, b2) => a.upTo - b2.upTo)
      .concat(tiers.filter((t) => t.upTo === null).slice(-1));
    if (!tiers.length) tiers = clone(def.tiers);
    if (tiers[tiers.length - 1].upTo !== null) tiers.push({ upTo: null, perKw: tiers[tiers.length - 1].perKw });
    const minKw = num(p.minKw, def.minKw, 0, 1e6);
    return {
      tariff: num(p.tariff, def.tariff, 0.5, 50),
      day: Math.round(num(p.day, def.day, 20, 90) / 5) * 5,
      bill: { min, max, step: num(b.step, def.bill.step, 1, max), value: num(b.value, def.bill.value, min, max) },
      round: num(p.round, def.round, 0.1, 1000),
      minKw,
      maxKw: Math.max(num(p.maxKw, def.maxKw, 0, 1e6), minKw),
      tiers,
    };
  }

  function normalizeRoi(d) {
    d = d && typeof d === 'object' ? d : {};
    const def = DEFAULTS.roi;
    return {
      yield: num(d.yield, def.yield, 30, 250),
      degradation: num(d.degradation, def.degradation, 0, 0.05),
      home: normalizeProfile(d.home, def.home),
      factory: normalizeProfile(d.factory, def.factory),
    };
  }

  function normalizeContact(d) {
    d = d && typeof d === 'object' ? d : {};
    const def = DEFAULTS.contact;
    const lines = Array.isArray(d.addressLines) ? d.addressLines.map((l) => str(l, '', 120)).filter(Boolean).slice(0, 6) : null;
    // Social links must be absolute https; a bare TikTok handle ("@name") becomes its profile URL.
    const social = (v) => { const u = safeUrl(v); return /^https:\/\//i.test(u) ? u : ''; };
    const handle = typeof d.tiktok === 'string' ? d.tiktok.trim() : '';
    // Rows written outside the admin panel may use phone_office / line instead.
    let phone = str(d.phone, def.phone, 80);
    const office = str(d.phone_office, '', 40);
    if (office && !phone.includes(office)) phone = (phone ? `${phone}, ${office}` : office).slice(0, 80);
    return {
      addressLines: lines && lines.length ? lines : clone(def.addressLines),
      phone,
      email: str(d.email, def.email, 120),
      hours: str(d.hours, def.hours, 80),
      lineId: str(d.lineId ?? d.line, def.lineId, 40),
      facebook: social(d.facebook),
      instagram: social(d.instagram),
      youtube: social(d.youtube),
      tiktok: /^@[\w.]{2,30}$/.test(handle) ? `https://www.tiktok.com/${handle}` : social(d.tiktok),
    };
  }

  function normalizeProjects(d) {
    d = d && typeof d === 'object' ? d : {};
    const def = DEFAULTS.projects;
    // Always exactly four figures: the about-us panel has four stat cards.
    const stats = def.stats.map((ds, i) => {
      const s = Array.isArray(d.stats) && d.stats[i] && typeof d.stats[i] === 'object' ? d.stats[i] : ds;
      return { value: num(s.value, ds.value, 0, 1e9), small: str(s.small, '', 20), label: str(s.label, '', 120) };
    });
    const items = Array.isArray(d.items)
      ? d.items.slice(0, 80).map((p) => {
          p = p && typeof p === 'object' ? p : {};
          return {
            name: str(p.name, '', 120),
            category: PROJECT_CATEGORIES.includes(p.category) ? p.category : 'business',
            location: str(p.location, '', 120),
            kw: num(p.kw, 0, 0, 1e6),
            saving: num(p.saving, 0, 0, 1e9),
            savingUpTo: p.savingUpTo === true,
            year: Math.round(num(p.year, 0, 0, 3000)),
            image: safeUrl(p.image),
            featured: p.featured === true,
          };
        }).filter((p) => p.name)
      : clone(def.items);
    const clients = Array.isArray(d.clients)
      ? d.clients.slice(0, 30).map((c) => {
          c = c && typeof c === 'object' ? c : {};
          // w/h: the logo file's pixel size, used as img width/height (optional)
          return { name: str(c.name, '', 80), logo: safeUrl(c.logo), w: Math.round(num(c.w, 0, 0, 4000)), h: Math.round(num(c.h, 0, 0, 4000)) };
        }).filter((c) => c.logo)
      : clone(def.clients);
    return { stats, items, clients };
  }

  const NORMALIZE = { hero: normalizeHero, packages: normalizePackages, roi: normalizeRoi, contact: normalizeContact, projects: normalizeProjects };

  // Complete content: remote sections where present and valid, defaults elsewhere.
  function resolve(remote) {
    const out = {};
    for (const key of SECTIONS) out[key] = NORMALIZE[key](remote && remote[key] ? remote[key] : DEFAULTS[key]);
    return out;
  }

  // ---------- Supabase (public read via REST; no client library needed) ----------

  function config() {
    const c = window.SOLAR1_SUPABASE || {};
    const url = typeof c.url === 'string' ? c.url.trim().replace(/\/+$/, '') : '';
    const anonKey = typeof c.anonKey === 'string' ? c.anonKey.trim() : '';
    const adminEmail = typeof c.adminEmail === 'string' ? c.adminEmail.trim() : '';
    return /^https:\/\/[^/]+$/.test(url) && anonKey ? { url, anonKey, adminEmail } : null;
  }

  // Resolves to { section: data } for every row, {} when nothing is stored.
  // Rejects on network/HTTP errors or after timeoutMs.
  async function fetchRemote(timeoutMs = 4000) {
    const cfg = config();
    if (!cfg) throw new Error('not-configured');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      // Legacy anon keys are JWTs and may also go in Authorization; the newer
      // publishable keys (sb_publishable_…) are not JWTs and only work as apikey.
      const headers = { apikey: cfg.anonKey, Accept: 'application/json' };
      if (cfg.anonKey.startsWith('eyJ')) headers.Authorization = `Bearer ${cfg.anonKey}`;
      const res = await fetch(`${cfg.url}/rest/v1/site_content?select=key,data`, {
        headers,
        signal: ctrl.signal,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      const out = {};
      if (Array.isArray(rows)) rows.forEach((r) => { if (r && SECTIONS.includes(r.key)) out[r.key] = r.data; });
      return out;
    } finally {
      clearTimeout(timer);
    }
  }

  // Last good remote content, so repeat visits render it without waiting.
  const CACHE_KEY = 'solar1:content:v1';

  function readCache() {
    const cfg = config();
    if (!cfg) return null;
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return c && c.src === cfg.url && c.data && typeof c.data === 'object' ? c.data : null;
    } catch { return null; }
  }

  function writeCache(data) {
    const cfg = config();
    if (!cfg) return;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ src: cfg.url, at: Date.now(), data })); } catch { /* storage full or blocked */ }
  }

  window.SolarContent = {
    SECTIONS,
    defaults: () => clone(DEFAULTS),
    normalize: (key, data) => NORMALIZE[key](data),
    resolve,
    config,
    fetchRemote,
    readCache,
    writeCache,
    esc,
    safeUrl,
  };
})();
