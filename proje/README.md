# Engineering Tool

Elektrik mühendisliği hesap makineleri — açık ve ücretsiz.

## Klasör Yapısı

```
/proje-klasörü
  index.html                     → Ana sayfa (tüm araçların listesi)
  /css
    style.css                    → TÜM sayfaların kullandığı ortak stil
  /calculators
    /gerilim-dusumu
      index.html                 → Gerilim düşümü hesaplayıcı sayfası
      script.js                  → Hesaplama mantığı (JavaScript)
    /kablo-kesit                 → (yeni araç eklenince buraya benzer bir klasör açılır)
```

## Yeni bir hesap makinesi eklemek istediğinde

1. `calculators/` içinde yeni bir klasör aç (örn. `calculators/kablo-kesit/`)
2. İçine `index.html` ve `script.js` koy (gerilim-dusumu klasöründeki dosyaları kopyalayıp değiştirebilirsin)
3. `<link rel="stylesheet" href="../../css/style.css">` satırını değiştirme — ortak stil oradan geliyor
4. Ana sayfadaki (`index.html`) ilgili `tool-card` kutusunu `disabled` sınıfından çıkar ve linkini yeni sayfana yönlendir

## Ortak stili değiştirmek istediğinde

Sadece `css/style.css` dosyasını düzenle — değişiklik otomatik olarak TÜM sayfalara yansır.
