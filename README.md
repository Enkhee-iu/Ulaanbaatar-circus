# UB Circus — local admin

## Энэ компьютер дээр ашиглах

`start-local.cmd` файлыг нээнэ. Сервер ажиллаж байгаа үед:

- Сайт: http://127.0.0.1:5173/
- Удирдлага: http://127.0.0.1:5173/admin

Эхний удаа admin хуудаснаас өөрийн имэйл, хамгийн багадаа 8 тэмдэгттэй нууц үг үүсгэнэ. Дараа нь энэ мэдээллээрээ нэвтэрнэ. Нэвтрэлт 8 цаг хүчинтэй. Нууц үг scrypt hash хэлбэрээр хадгалагдана; session cookie нь HttpOnly, SameSite=Strict.

## Боломжууд

Header-ийн **MN / EN** товчоор Монгол, Англи хэл сонгоно. Анхны хэл Монгол; сонголт browser-ийн localStorage-д хадгалагдана. Admin-ийн бичлэг засах дэлгэцийн **Монгол хэлний хувилбар** хэсэгт Монгол нэр, тайлбар, шошго, байршлаа оруулна. Үндсэн нэр, тайлбарын талбарууд Англи хувилбар байна. Тохиргооноос нүүр хуудасны хоёр хэлний текстийг засна. Монгол талбар хоосон байвал суурь орчуулга, эсвэл үндсэн Англи текст харагдана.

- Тоглолт, эвент, төсөл нэмэх / засах / устгах.
- Ноорог эсвэл нийтэлсэн төлөв сонгох. Зөвхөн нийтэлсэн бичлэг сайт дээр харагдана.
- Бичлэгийн дараалал өөрчлөх, нэрээр хайх, төлөвөөр шүүх.
- JPG, PNG, WebP зураг оруулах (5 MB хүртэл), агуулгадаа зураг сонгох.
- Нүүр хуудасны гарчиг, тайлбар, хоёр зураг, статистик, логоны нэр, холбоо барих мэдээлэл өөрчлөх.
- Нууц үг өөрчлөх, гарах.

Хадгалсны дараа сайтаа шинэчилж харах эсвэл сайтын цонх руу буцахад шинэ мэдээллийг авна. Admin нь localhost-д зориулагдсан; интернетэд ажиллуулахын өмнө өгөгдлийн сан, зураг хадгалах үйлчилгээ болон онлайн нэвтрэлтийг тохируулах шаардлагатай.

## Өгөгдөл ба нөөц

`.ubcircus/data/` хавтсанд `content.json`, `auth.json`, `media/` үүснэ. Хавтас Git-д орохгүй. Серверийг зогсоогоод **энэ хавтсыг бүтнээр нь** өөр найдвартай газар хуулж нөөцлөөрэй. Сэргээхдээ серверийг зогсоогоод нөөц хавтсаа байранд нь хуулна. `auth.json` нь нэвтрэлтийн мэдээлэлтэй тул нөөцийг нийтэд хуваалцахгүй.

Нууц үгээ мартсан бол серверийг зогсоож `auth.json`-ийг хувийн нөөц рүү зөөгөөд дахин асаана. `/admin` дээр шинээр бүртгэл үүсгэнэ; `content.json` болон `media/` хадгалагдана. Энэ нь файлуудад хандах эрхтэй компьютерийн эзэнд зориулсан local сэргээх арга.

Анхны зурагнууд AI illustration бөгөөд бодит UB Circus тоглолтын баримтат зураг биш. Өөрийн бодит зургаар admin-аас солино. Холбоо барих форм нь имэйл аппад draft бэлддэг; автоматаар имэйл илгээдэггүй.

## Хөгжүүлэлт

Node.js 22.12+ (эсвэл 24 LTS), npm dependencies шаардлагатай.

```sh
npm install
npm run dev:local
```

Тусдаа Node серверийн build:

```sh
npm run build:local
npm run start:local
```

`build:local` нь Node серверийн target ашиглана. Энгийн `build` нь Lovable-ийн Cloudflare тохиргоог хадгална; local файлын admin-ийг Cloudflare-д шууд ашиглахгүй. `UB_CIRCUS_DATA_DIR` environment variable-аар өгөгдлийн өөр хавтас сонгож болно. Нэг өгөгдлийн хавтаст нэг сервер ажиллуулна.

### Захиалгын хүсэлт

`/contact`-оос илгээсэн хүсэлт `.ubcircus/data/enquiries.json` файлд хадгалагдана.
`/admin` → **Захиалгын хүсэлт** хэсэгт нэр, имэйл, байгууллагаар хайх, төлөвөөр шүүх,
дэлгэрэнгүй үзэх, дотоод тэмдэглэл болон төлөв хадгалах боломжтой.
Хүсэлтийн жагсаалт зөвхөн нэвтэрсэн админд харагдана. Имэйлээр хариулах товч нь
имэйл аппд draft нээнэ; имэйлийг автоматаар илгээхгүй.
Энэ API одоогоор localhost орчинд ажиллана. Өгөгдлийг нөөцлөхдөө `enquiries.json`-ийг мөн хамруулна.

### Тоглолтын дэлгэрэнгүй хуудас

Тоглолтын карт `/shows/:showId` хуудсыг нээнэ. Зөвхөн нийтэлсэн тоглолт харагдана.
Admin → Тоглолтууд → Засах хэсэгт дэлгэрэнгүй танилцуулгыг Монгол/Англи хэлээр,
галерейн 8 хүртэл нэмэлт зураг, HTTPS MP4/WebM видео файлын холбоос оруулж болно.
Үндсэн зураг галерейд автоматаар багтана. Видео холбоосгүй бол видео хэсгийг харуулахгүй.
"Захиалах" товч тухайн тоглолтын нэрийг хүсэлтийн маягтад дамжуулна.

### Content recovery and media validation

Valid local content is backed up in `.ubcircus/data/content.backup.json`. If the main content file becomes invalid, public pages use the backup and `/admin` remains accessible. Sign in and choose **Нөөц хуулбарыг сэргээх**; the damaged file is preserved as `content.damaged.<timestamp>.json`. If no valid backup exists, the admin explains that manual recovery is required.

The optional home film URL is in Admin → Тохиргоо. Use a YouTube link or a direct HTTPS MP4/WebM link. The home hero plays the video muted in a loop with only the Shows and Contact actions. While the video loads or is unavailable, the hero retains a plain dark background. Uploads are fully decoded with Sharp before storage (5 MB / 40 million pixels maximum; single-frame JPG, PNG, WebP).

Regression checks: `node scripts/review-fixes.mjs` (Node 24). They use a temporary isolated data directory and remove it after execution.
