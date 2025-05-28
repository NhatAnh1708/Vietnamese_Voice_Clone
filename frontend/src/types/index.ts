export type Voice = {
          id: string;
          name: string;
          gender: string;
          language: string;
        };
        
        export type Mood = {
          id: string;
          name: string;
          selected: boolean;
        };
        
        export type Notification = {
          id: string;
          title: string;
          message: string;
          read: boolean;
          timestamp: Date;
        };
        
        export type StoryGenre = {
          id: string;
          name: string;
          selected: boolean;
        };