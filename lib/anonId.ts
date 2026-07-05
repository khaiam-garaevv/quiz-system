// Hər ziyarətçi üçün brauzerdə saxlanılan, kimliyi bilinməyən (anonim) ID.
// Auth yoxdur — sadəcə həmin brauzerin öz nəticə tarixçəsini görməsi üçündür.
// Başqa cihazdan/brauzerdən girsə, fərqli ID alacaq və tarixçəsi boş olacaq.

const STORAGE_KEY = "quiz_anon_id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
