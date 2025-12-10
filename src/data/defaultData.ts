import type { Group, Challenge, GameConfig } from '../types';

export const defaultConfig: GameConfig = {
  title: 'Killer Game',
  spreadFactor: 0.7,
  adminPassword: 'admin123',
};

export const defaultGroups: Group[] = [
  { id: 'group-1', name: 'Group 1', color: '#4CAF50' },
  { id: 'group-2', name: 'Group 2', color: '#2196F3' },
  { id: 'group-3', name: 'Group 3', color: '#FF9800' },
  { id: 'group-4', name: 'Group 4', color: '#9C27B0' },
];

export const defaultChallenges: Challenge[] = [
  { id: '1', text: "Ask your target to show you the most recent photo on their phone." },
  { id: '2', text: "Convince them to close their eyes for 3 seconds." },
  { id: '3', text: "Get them to teach you a gesture they often use." },
  { id: '4', text: "Ask them their favorite word." },
  { id: '5', text: "Get them to tell you about a dream they had recently." },
  { id: '6', text: "Get them to cite a proverb (any proverb)." },
  { id: '7', text: "Get them to show how they would write their first name with their non-dominant hand." },
  { id: '8', text: "Ask them what word they would remove from the dictionary if they could." },
  { id: '9', text: "Convince them to name an object they can't stand." },
  { id: '10', text: "Convince them to smell an imaginary scent ('Do you smell that? Doesn't it smell like pine?')." },
  { id: '11', text: "Get them to say a word in Latin, even at random." },
  { id: '12', text: "Convince them to make an animal sound for one second." },
  { id: '13', text: "Get them to zip up a zipper on you (coat, jacket...)." },
  { id: '14', text: "Get them to say a word you barely whisper (intrigue effect)." },
  { id: '15', text: "Get them to say a word while pretending not to be sure of its pronunciation." },
  { id: '16', text: "Ask them to describe the sensation of walking in fresh snow." },
  { id: '17', text: "Take a photo of both your shadows together." },
  { id: '18', text: "Ask them to take a photo of a red object 'for a secret project'." },
  { id: '19', text: "Convince them to take a photo where you both jump (mini-jump)." },
  { id: '20', text: "Take a photo where you both have your eyes closed on purpose." },
  { id: '21', text: "Take a photo where you point in opposite directions." },
  { id: '22', text: "Take a photo with your foreheads 10 cm apart (without touching)." },
  { id: '23', text: "Take a photo where the target must have an object on their head." },
  { id: '24', text: "Ask them for a photo taken from a 'dramatic low angle'." },
  { id: '25', text: "Get them to take a selfie saying 'cheese' very exaggerated." },
  { id: '26', text: "Photo where an object is in the foreground and you in the background." },
  { id: '27', text: "Get them to say: 'Today, the snow is excellent'." },
  { id: '28', text: "Convince them to imitate the sound of a ski lift." },
  { id: '29', text: "Get them to choose their 'Mountain Totem' (animal, rock, element)." },
  { id: '30', text: "Get them to show a technical ski movement (snowplow, carving...)." },
];
