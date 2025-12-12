import enUS from "@/configs/langs/en-us";
import jaJP from "@/configs/langs/ja-jp";

const langMap: Record<string, ConstantTexts> = {
  'en-US': enUS,
  'ja-JP': jaJP,
}

interface ConstantTexts {
  welcome?: string;
  goodbye?: string;
  error?: string;
  now?: (d: Date) => string;
}

const lang = navigator.language;
const texts: ConstantTexts = langMap[lang] || langMap['en-US'];

export default texts;