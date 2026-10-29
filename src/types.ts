export type ContentType = 'email' | 'message';

export type ToneType = 'Formal' | 'Professional' | 'Friendly' | 'Casual';

export type LengthType = 'Short' | 'Medium' | 'Detailed';

export type LanguageType = 'English' | 'Hindi' | 'Hinglish';

export interface GenerationParams {
  contentType: ContentType;
  purpose: string;
  recipient: string;
  sender: string;
  context: string;
  tone: ToneType;
  length: LengthType;
  language: LanguageType;
}

export interface PresetTemplate {
  title: string;
  contentType: ContentType;
  purpose: string;
  recipient: string;
  sender: string;
  context: string;
  tone: ToneType;
  length: LengthType;
  language: LanguageType;
  badge: string;
}
