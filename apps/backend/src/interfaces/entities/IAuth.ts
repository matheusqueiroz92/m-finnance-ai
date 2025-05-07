export interface ISocialProfile {
  id: string;
  provider: 'google' | 'facebook' | 'github';
  emails?: { value: string }[];
  name?: {
    givenName?: string;
    familyName?: string;
  };
  photos?: { value: string }[];
  displayName?: string;
  username?: string;
}
  
export interface ISocialUser {
  id: string;
  provider: string;
  email: string;
  name: string;
  photo?: string;
}