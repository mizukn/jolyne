import {
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    enableValidators,
    StringSelectMenuBuilder,
} from "discord.js";
import { AnswerChineseNewYearQuizQuest, SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";
import { cloneDeep } from "lodash";
import { Hangbao } from "../Items/Items";

export const startOf2025ChineseNewYear = new Date(1738080000000);
// endOf = after 1 week
export const endOf2025ChineseNewYear = new Date(
    startOf2025ChineseNewYear.getTime() + 14 * 24 * 60 * 60 * 1000
);
export const is2025ChineseNewYear = (): boolean =>
    new Date() >= startOf2025ChineseNewYear && new Date() <= endOf2025ChineseNewYear;

export const ChineseNewYear2025EventMessage = (ctx: CommandInteractionContext): string => {
    // beast nian
    return `\`\`\`
The Chinese New Year is here! The beast Nian has come to the city and is causing chaos.
Defeat it to earn some Social Credits.
\`\`\`
- Use the ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} \`[side_quest: ChineseNewYearEvent2025]\` command to view your progress about the side quest
- Use the ${ctx.client.getSlashCommandMention(
        "event quiz"
    )} command to answer a quiz and earn Social Credits
- ${ctx.client.getSlashCommandMention(
        "raid"
    )} the event boss, **Beast Nian** to earn 🧧 **Hangbaos**
- Every **250** social credits you earn, you gain 🧧 **12 Hangbaos**
- Every **750** social credits you lose, you lose **2%** of your coins ${
        ctx.client.localEmojis.jocoins
    }
- This event features the limited weapon ${ctx.client.localEmojis.snake_jian} **Snake Jian**
- - You can craft this weapon by using the ${ctx.client.getSlashCommandMention("craft")} command
- - You can get some **Snake Skins** by defeating the Celestial Snakes from your ${ctx.client.getSlashCommandMention(
        "side quest view"
    )} or from the ${ctx.client.getSlashCommandMention("event trade")}
- - You can get some **Beast Nian's Horn** by defeating **Beast Nian** from ${ctx.client.getSlashCommandMention(
        "raid"
    )} or from the ${ctx.client.getSlashCommandMention("event trade")}\n
-# - You can only have x3 copies of ${
        ctx.client.localEmojis.snake_jian
    } **Snake Jian** until the end of the event.
-# - You can use the ${ctx.client.getSlashCommandMention(
        "event progress"
    )} command to view your social credits progress
`;
};
export const trades = [
    {
        amount: 5,
        item: "snake_skin",
    },
    {
        amount: 50,
        item: "beast_nians_horn",
    },

    {
        amount: 30,
        item: "skill_points_reset_potion",
    },
    {
        amount: 30,
        item: "rare_stand_arrow",
    },
    {
        amount: 900,
        item: "requiem_arrow",
    },
    {
        amount: 1050,
        item: "snake_jian",
    },
].sort((a, b) => a.amount - b.amount);

export const ChineseNewYear2025Eventquiz: {
    question: string;
    answers: {
        answer: string;
        correct: boolean;
    }[];
}[] = [
    {
        question: "What is the capital of China?",
        answers: [
            {
                answer: "Beijing",
                correct: true,
            },
            {
                answer: "Shanghai",
                correct: false,
            },
            {
                answer: "Hong Kong",
                correct: false,
            },
            {
                answer: "Taiwan",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these is NOT a Chinese invention?",
        answers: [
            {
                answer: "Compass",
                correct: false,
            },
            {
                answer: "Tea",
                correct: false,
            },

            {
                answer: "Gunpowder",
                correct: false,
            },
            {
                answer: "Paper",
                correct: false,
            },
            {
                answer: "Telescope ",
                correct: true,
            },
        ],
    },
    {
        question: "How many stars are on the Chinese flag?",
        answers: [
            {
                answer: "3",
                correct: false,
            },
            {
                answer: "4",
                correct: false,
            },
            {
                answer: "5",
                correct: true,
            },
            {
                answer: "Too many to count!",
                correct: false,
            },
        ],
    },
    {
        question: "What is the largest holiday in China?",
        answers: [
            {
                answer: "Chinese New Year",
                correct: true,
            },
            {
                answer: "Lantern Festival",
                correct: false,
            },
            {
                answer: "Dragon Boat Festival",
                correct: false,
            },
            {
                answer: "Qingming Festival",
                correct: false,
            },
        ],
    },
    {
        question: "What is the national animal of China?",
        answers: [
            {
                answer: "Panda",
                correct: true,
            },
            {
                answer: "Tiger",
                correct: false,
            },
            {
                answer: "Dragon",
                correct: false,
            },
            {
                answer: "Monkey",
                correct: false,
            },
        ],
    },
    {
        question: 'Who is the "people\'s leader" of China?',
        answers: [
            {
                answer: "Mao Zedong",
                correct: false,
            },
            {
                answer: "Xi Jinping",
                correct: true,
            },
            {
                answer: "Deng Xiaoping",
                correct: false,
            },
            {
                answer: "Sun Yat-sen",
                correct: false,
            },
        ],
    },
    {
        question: "What is the national sport in China?",
        answers: [
            {
                answer: "Soccer",
                correct: false,
            },
            {
                answer: "Basketball",
                correct: false,
            },
            {
                answer: "Table Tennis",
                correct: true,
            },
            {
                answer: "Badminton",
                correct: false,
            },
        ],
    },
    {
        question: "What is the primary language spoken in China?",
        answers: [
            {
                answer: "Mandarin",
                correct: true,
            },
            {
                answer: "Cantonese",
                correct: false,
            },
            {
                answer: "Hokkien",
                correct: false,
            },
            {
                answer: "Wu",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese zodiac sign for 2025?",
        answers: [
            {
                answer: "Rabbit",
                correct: false,
            },
            {
                answer: "Dragon",
                correct: false,
            },
            {
                answer: "Snake",
                correct: true,
            },
            {
                answer: "Goat",
                correct: false,
            },
        ],
    },
    {
        question: "What is the longest wall in the world?",
        answers: [
            {
                answer: "The Great Wall of China",
                correct: true,
            },
            {
                answer: "The Berlin Wall",
                correct: false,
            },
            {
                answer: "The Firewall of China",
                correct: false,
            },
            {
                answer: "Wall-E",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese dish is traditionally eaten during Chinese New Year?",
        answers: [
            {
                answer: "Dumplings",
                correct: true,
            },
            {
                answer: "Fried Rice",
                correct: false,
            },
            {
                answer: "Sweet and Sour Pork",
                correct: false,
            },
            {
                answer: "Peking Duck",
                correct: false,
            },
        ],
    },
    {
        question: "What does the term 'Social Credit System' refer to?",
        answers: [
            {
                answer: "A system that tracks citizens' economic and social behaviors",
                correct: true,
            },
            {
                answer: "A rewards system for gaming",
                correct: false,
            },
            {
                answer: "A competition for free housing",
                correct: false,
            },
            {
                answer: "The Chinese tax system",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these is banned in China?",
        answers: [
            {
                answer: "Facebook",
                correct: true,
            },
            {
                answer: "WeChat",
                correct: false,
            },
            {
                answer: "Douyin",
                correct: false,
            },
            {
                answer: "Taobao",
                correct: false,
            },
        ],
    },
    {
        question: "What is considered the 'Chinese Dream'?",
        answers: [
            {
                answer: "National rejuvenation and prosperity for all",
                correct: true,
            },
            {
                answer: "Unlimited noodles for everyone",
                correct: false,
            },
            {
                answer: "Moving to the West",
                correct: false,
            },
            {
                answer: "Buying Bitcoin",
                correct: false,
            },
        ],
    },
    {
        question: "How many people live in China (as of 2025)?",
        answers: [
            {
                answer: "1 billion",
                correct: false,
            },
            {
                answer: "1.4 billion",
                correct: true,
            },
            {
                answer: "2 billion",
                correct: false,
            },
            {
                answer: "More than there are stars in the sky",
                correct: false,
            },
        ],
    },
    {
        question: "Which country has the largest high-speed rail network in the world?",
        answers: [
            {
                answer: "China",
                correct: true,
            },
            {
                answer: "Japan",
                correct: false,
            },
            {
                answer: "France",
                correct: false,
            },
            {
                answer: "USA",
                correct: false,
            },
        ],
    },
    {
        question: "How do you say 'hello' in Mandarin?",
        answers: [
            {
                answer: "Ni Hao",
                correct: true,
            },
            {
                answer: "Konichiwa",
                correct: false,
            },
            {
                answer: "Bonjour",
                correct: false,
            },
            {
                answer: "Hello Kitty",
                correct: false,
            },
        ],
    },
    {
        question: "Which animal is believed to bring good fortune in Chinese culture?",
        answers: [
            {
                answer: "Dragon",
                correct: true,
            },
            {
                answer: "Tiger",
                correct: false,
            },
            {
                answer: "Panda",
                correct: false,
            },
            {
                answer: "Snake",
                correct: false,
            },
        ],
    },
    {
        question: "What does 'Made in China' represent globally?",
        answers: [
            {
                answer: "World’s manufacturing hub",
                correct: true,
            },
            {
                answer: "Cheap products",
                correct: false,
            },
            {
                answer: "High-quality goods",
                correct: false,
            },
            {
                answer: "Everything you own",
                correct: false,
            },
        ],
    },
    {
        question: "What is the penalty for saying bad things about the government in China?",
        answers: [
            {
                answer: "Decrease in social credit score",
                correct: true,
            },
            {
                answer: "A polite warning",
                correct: false,
            },
            {
                answer: "Free food",
                correct: false,
            },
            {
                answer: "Praise for creativity",
                correct: false,
            },
        ],
    },
    {
        question: "What is the most spoken language in the world?",
        answers: [
            {
                answer: "Mandarin Chinese",
                correct: true,
            },
            {
                answer: "English",
                correct: false,
            },
            {
                answer: "Spanish",
                correct: false,
            },
            {
                answer: "French",
                correct: false,
            },
        ],
    },
    {
        question: "Which dynasty built most of the Great Wall of China?",
        answers: [
            {
                answer: "Ming Dynasty",
                correct: true,
            },
            {
                answer: "Qing Dynasty",
                correct: false,
            },
            {
                answer: "Tang Dynasty",
                correct: false,
            },
            {
                answer: "Han Dynasty",
                correct: false,
            },
        ],
    },
    {
        question: "What color is associated with good luck in Chinese culture?",
        answers: [
            {
                answer: "Red",
                correct: true,
            },
            {
                answer: "Blue",
                correct: false,
            },
            {
                answer: "Green",
                correct: false,
            },
            {
                answer: "Yellow",
                correct: false,
            },
        ],
    },
    {
        question: "What is the most popular social media platform in China?",
        answers: [
            {
                answer: "WeChat",
                correct: true,
            },
            {
                answer: "Facebook",
                correct: false,
            },
            {
                answer: "Twitter",
                correct: false,
            },
            {
                answer: "TikTok",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these is considered a traditional Chinese sport?",
        answers: [
            {
                answer: "Kung Fu",
                correct: true,
            },
            {
                answer: "Sumo Wrestling",
                correct: false,
            },
            {
                answer: "Baseball",
                correct: false,
            },
            {
                answer: "Soccer",
                correct: false,
            },
        ],
    },
    {
        question: "What is the name of China’s space agency?",
        answers: [
            {
                answer: "China National Space Administration (CNSA)",
                correct: true,
            },
            {
                answer: "NASA China Division",
                correct: false,
            },
            {
                answer: "Asian Space Federation",
                correct: false,
            },
            {
                answer: "Great Space Wall",
                correct: false,
            },
        ],
    },
    {
        question: "Which philosophy originated in China?",
        answers: [
            {
                answer: "Confucianism",
                correct: true,
            },
            {
                answer: "Buddhism",
                correct: false,
            },
            {
                answer: "Hinduism",
                correct: false,
            },
            {
                answer: "Stoicism",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese currency called?",
        answers: [
            {
                answer: "Yuan (Renminbi)",
                correct: true,
            },
            {
                answer: "Yen",
                correct: false,
            },
            {
                answer: "Won",
                correct: false,
            },
            {
                answer: "Dollar",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese leader famously declared 'Let some people get rich first'?",
        answers: [
            {
                answer: "Deng Xiaoping",
                correct: true,
            },
            {
                answer: "Mao Zedong",
                correct: false,
            },
            {
                answer: "Xi Jinping",
                correct: false,
            },
            {
                answer: "Sun Yat-sen",
                correct: false,
            },
        ],
    },
    {
        question: "What is the traditional Chinese martial art performed with fans called?",
        answers: [
            {
                answer: "Tai Chi",
                correct: true,
            },
            {
                answer: "Karate",
                correct: false,
            },
            {
                answer: "Judo",
                correct: false,
            },
            {
                answer: "Aikido",
                correct: false,
            },
        ],
    },
    {
        question: "Which animal represents wealth and prosperity in Chinese culture?",
        answers: [
            {
                answer: "Fish",
                correct: true,
            },
            {
                answer: "Horse",
                correct: false,
            },
            {
                answer: "Rooster",
                correct: false,
            },
            {
                answer: "Pig",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese city is known as the 'Venice of the East'?",
        answers: [
            {
                answer: "Suzhou",
                correct: true,
            },
            {
                answer: "Shanghai",
                correct: false,
            },
            {
                answer: "Beijing",
                correct: false,
            },
            {
                answer: "Guangzhou",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese term for a harmonious society?",
        answers: [
            {
                answer: "Hexie Shehui",
                correct: true,
            },
            {
                answer: "Tianxia",
                correct: false,
            },
            {
                answer: "Renmin",
                correct: false,
            },
            {
                answer: "Gongheguo",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these is a famous Chinese proverb?",
        answers: [
            {
                answer: "A journey of a thousand miles begins with a single step.",
                correct: true,
            },
            {
                answer: "When in Rome, do as the Romans do.",
                correct: false,
            },
            {
                answer: "Better late than never.",
                correct: false,
            },
            {
                answer: "The squeaky wheel gets the grease.",
                correct: false,
            },
        ],
    },
    {
        question: "What is the significance of the color gold in Chinese culture?",
        answers: [
            {
                answer: "It symbolizes wealth and prosperity.",
                correct: true,
            },
            {
                answer: "It represents mourning and death.",
                correct: false,
            },
            {
                answer: "It signifies jealousy and envy.",
                correct: false,
            },
            {
                answer: "It stands for bravery and courage.",
                correct: false,
            },
        ],
    },
    {
        question: "What is the primary ingredient in traditional Chinese tofu?",
        answers: [
            {
                answer: "Soybeans",
                correct: true,
            },
            {
                answer: "Rice",
                correct: false,
            },
            {
                answer: "Wheat",
                correct: false,
            },
            {
                answer: "Corn",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese city is home to the Forbidden City?",
        answers: [
            {
                answer: "Beijing",
                correct: true,
            },
            {
                answer: "Shanghai",
                correct: false,
            },
            {
                answer: "Xi'an",
                correct: false,
            },
            {
                answer: "Chengdu",
                correct: false,
            },
        ],
    },
    {
        question: "What is the most popular type of Chinese tea?",
        answers: [
            {
                answer: "Green Tea",
                correct: true,
            },
            {
                answer: "Black Tea",
                correct: false,
            },
            {
                answer: "Oolong Tea",
                correct: false,
            },
            {
                answer: "White Tea",
                correct: false,
            },
        ],
    },
    {
        question: "What year marked the founding of the People's Republic of China?",
        answers: [
            {
                answer: "1949",
                correct: true,
            },
            {
                answer: "1939",
                correct: false,
            },
            {
                answer: "1959",
                correct: false,
            },
            {
                answer: "1969",
                correct: false,
            },
        ],
    },
    {
        question: "What does the dragon symbolize in Chinese culture?",
        answers: [
            {
                answer: "Power and good fortune",
                correct: true,
            },
            {
                answer: "Fear and destruction",
                correct: false,
            },
            {
                answer: "Wisdom and solitude",
                correct: false,
            },
            {
                answer: "Wealth and envy",
                correct: false,
            },
        ],
    },
    {
        question: "What is the staple food of Northern China?",
        answers: [
            {
                answer: "Wheat-based products like noodles and buns",
                correct: true,
            },
            {
                answer: "Rice",
                correct: false,
            },
            {
                answer: "Seafood",
                correct: false,
            },
            {
                answer: "Tofu",
                correct: false,
            },
        ],
    },
    {
        question: "How many animals are in the Chinese zodiac?",
        answers: [
            {
                answer: "12",
                correct: true,
            },
            {
                answer: "10",
                correct: false,
            },
            {
                answer: "14",
                correct: false,
            },
            {
                answer: "8",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these cities is famous for its Terracotta Army?",
        answers: [
            {
                answer: "Xi'an",
                correct: true,
            },
            {
                answer: "Beijing",
                correct: false,
            },
            {
                answer: "Shanghai",
                correct: false,
            },
            {
                answer: "Chengdu",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese name for the Yellow River?",
        answers: [
            {
                answer: "Huang He",
                correct: true,
            },
            {
                answer: "Yangtze",
                correct: false,
            },
            {
                answer: "Pearl River",
                correct: false,
            },
            {
                answer: "Mekong",
                correct: false,
            },
        ],
    },
    {
        question: "What does the Chinese phrase 'guanxi' refer to?",
        answers: [
            {
                answer: "Personal connections and relationships",
                correct: true,
            },
            {
                answer: "Business negotiations",
                correct: false,
            },
            {
                answer: "Government propaganda",
                correct: false,
            },
            {
                answer: "Traditional healing practices",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these is a traditional Chinese instrument?",
        answers: [
            {
                answer: "Erhu",
                correct: true,
            },
            {
                answer: "Guitar",
                correct: false,
            },
            {
                answer: "Violin",
                correct: false,
            },
            {
                answer: "Trumpet",
                correct: false,
            },
        ],
    },
    {
        question:
            "Which Chinese philosopher is known for his teachings on morality and social harmony?",
        answers: [
            {
                answer: "Confucius",
                correct: true,
            },
            {
                answer: "Laozi",
                correct: false,
            },
            {
                answer: "Mencius",
                correct: false,
            },
            {
                answer: "Sun Tzu",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese martial art that focuses on balance and meditation?",
        answers: [
            {
                answer: "Tai Chi",
                correct: true,
            },
            {
                answer: "Wing Chun",
                correct: false,
            },
            {
                answer: "Shaolin Kung Fu",
                correct: false,
            },
            {
                answer: "Jeet Kune Do",
                correct: false,
            },
        ],
    },
    {
        question: "Which is the most famous mountain range in China?",
        answers: [
            {
                answer: "Himalayas",
                correct: true,
            },
            {
                answer: "Rockies",
                correct: false,
            },
            {
                answer: "Andes",
                correct: false,
            },
            {
                answer: "Alps",
                correct: false,
            },
        ],
    },
    {
        question: "Which of these dishes is traditionally NOT Chinese?",
        answers: [
            {
                answer: "Sushi",
                correct: true,
            },
            {
                answer: "Dumplings",
                correct: false,
            },
            {
                answer: "Sweet and Sour Pork",
                correct: false,
            },
            {
                answer: "Peking Duck",
                correct: false,
            },
        ],
    },
    {
        question: "What is celebrated during the Mid-Autumn Festival in China?",
        answers: [
            {
                answer: "The harvest moon",
                correct: true,
            },
            {
                answer: "New Year’s Eve",
                correct: false,
            },
            {
                answer: "The winter solstice",
                correct: false,
            },
            {
                answer: "Ancestor worship",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese city is famous for its giant pandas?",
        answers: [
            {
                answer: "Chengdu",
                correct: true,
            },
            {
                answer: "Beijing",
                correct: false,
            },
            {
                answer: "Shanghai",
                correct: false,
            },
            {
                answer: "Xi'an",
                correct: false,
            },
        ],
    },
    {
        question: "What is the nickname for Shanghai?",
        answers: [
            {
                answer: "The Pearl of the Orient",
                correct: true,
            },
            {
                answer: "The Land of Dragons",
                correct: false,
            },
            {
                answer: "The City of Pandas",
                correct: false,
            },
            {
                answer: "The Golden City",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese practice of arranging living spaces for harmony called?",
        answers: [
            {
                answer: "Feng Shui",
                correct: true,
            },
            {
                answer: "Qi Gong",
                correct: false,
            },
            {
                answer: "Kung Fu",
                correct: false,
            },
            {
                answer: "Tai Chi",
                correct: false,
            },
        ],
    },
    {
        question: "Which Chinese festival features dragon boat races?",
        answers: [
            {
                answer: "Dragon Boat Festival",
                correct: true,
            },
            {
                answer: "Mid-Autumn Festival",
                correct: false,
            },
            {
                answer: "Lantern Festival",
                correct: false,
            },
            {
                answer: "Qingming Festival",
                correct: false,
            },
        ],
    },
    {
        question: "What is the Chinese word for 'hello'?",
        answers: [
            {
                answer: "Ni hao",
                correct: true,
            },
            {
                answer: "Xie xie",
                correct: false,
            },
            {
                answer: "Cao ni ma",
                correct: false,
            },
            {
                answer: "Wo ai ni",
                correct: false,
            },
        ],
    },
    {
        question: "Glory to the CCP?",
        answers: [
            {
                answer: "Yes!",
                correct: true,
            },
            {
                answer: "Oui!",
                correct: true,
            },
            {
                answer: "Si!",
                correct: true,
            },
            {
                answer: "是!",
                correct: true,
            },
        ],
    },
    {
        question: "Is China a great country?",
        answers: [
            {
                answer: "Affirmative.",
                correct: true,
            },
            {
                answer: "Yes, but it could be better.",
                correct: false,
            },
            {
                answer: "No, it's terrible.",
                correct: false,
            },
        ],
    },
    {
        question:
            "The Chinese Zodiac, also known as the Twelve Animal Signs, represents people's birth years with twelve animals. In the Chinese zodiac, the dragon is ranked the **?**th place.",
        answers: [
            {
                answer: "1",
                correct: false,
            },
            {
                answer: "2",
                correct: false,
            },
            {
                answer: "3",
                correct: false,
            },
            {
                answer: "4",
                correct: false,
            },
            {
                answer: "5",
                correct: true,
            },
        ],
    },
];

export const ChineseNewYear2025EventSlashCommandData: SlashCommand["data"] = {
    name: "event",
    description: "Check the current event.",
    type: 1,
    options: [
        {
            name: "info",
            description: "Get information about the current event.",
            type: 1,
            options: [],
        },
        {
            name: "trade",
            description: "Trade your hangbaos for items.",
            type: 1,
            options: [],
        },

        {
            name: "progress",
            description: "Unlock items and rewards with your social credits!",
            type: 1,
            options: [],
        },
        {
            name: "quiz",
            description: "Answer a quiz to earn social credits! (or lose some)",
            type: 1,
            options: [],
        },
    ],
};

export const ChineseNewYear2025EventCommand: SlashCommand["execute"] = async (ctx) => {
    if (!is2025ChineseNewYear()) {
        return ctx.makeMessage({
            content: "The event has ended.",
        });
    }
    if (ctx.interaction.options.getSubcommand() === "quiz") {
        const isOnCooldown = await ctx.client.database.redis.get(
            `chineseNewYear2025:cooldown_${ctx.user.id}`
        );
        if (isOnCooldown) {
            const noLongerCooldown = parseInt(isOnCooldown) + 15 * 60 * 1000;
            if (noLongerCooldown > Date.now()) {
                return ctx.makeMessage({
                    content: `Hey! Take a break. You can answer another quiz in ${Functions.generateDiscordTimestamp(
                        noLongerCooldown,
                        "FROM_NOW"
                    )}.`,
                });
            }
        }
        const deepQuiz = cloneDeep(ChineseNewYear2025Eventquiz);
        deepQuiz.forEach((quiz) => {
            quiz.answers = Functions.shuffleArray(quiz.answers);
        });

        const quiz = deepQuiz[Math.floor(Math.random() * deepQuiz.length)];
        const cpmnt = new StringSelectMenuBuilder()
            .setCustomId(ctx.interaction.id + "quiz")
            .setMinValues(1)
            .setMaxValues(quiz.answers.filter((a) => a.correct).length)
            .setPlaceholder("Select the correct answer(s)")
            .addOptions(
                quiz.answers.map((answer, i) => ({
                    label: answer.answer,
                    value: i.toString(),
                }))
            );
        const message = await ctx.makeMessage({
            embeds: [
                {
                    image: {
                        url: "https://ih1.redbubble.net/image.4599773230.4670/raf,750x1000,075,t,edbb3b:2ffb89aaee.webp",
                    },
                    color: 0xfed000,
                    author: {
                        name: quiz.question,
                    },
                    description: quiz.answers
                        .map((answer, i) => `${i + 1}. ${answer.answer}`)
                        .join("\n"),
                },
            ],
            components: [Functions.actionRow([cpmnt])],
        });

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                interaction.customId.includes(ctx.interaction.id) &&
                interaction.user.id === ctx.interaction.user.id,
            time: 30000,
            max: 1,
        });

        collector.on("collect", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;
            ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.interaction.user.id);

            const answers = interaction.values.map((v) => quiz.answers[parseInt(v)]);
            const correct =
                answers.every((a) => a.correct) &&
                answers.length === quiz.answers.filter((a) => a.correct).length;
            const almost =
                answers.every((a) => a.correct) &&
                answers.length !== quiz.answers.filter((a) => a.correct).length;

            ctx.makeMessage({
                embeds: [
                    {
                        image: {
                            url: correct
                                ? "https://imgcdn.sigstick.com/PEZ12CNbxTU8Nu1sQSrI/5-1.png"
                                : "https://en.stgrm.com/uploads/images/social-credit-china/social-credit-china-0.webp",
                        },
                        color: correct ? 0x00ff00 : 0xff0000,
                        author: {
                            name: quiz.question,
                        },
                        description: quiz.answers
                            .map(
                                (answer, i) =>
                                    `${i + 1}. ${answer.answer} ${
                                        answers.includes(answer)
                                            ? answer.correct
                                                ? "✅"
                                                : "❌"
                                            : ""
                                    }`
                            )
                            .join("\n"),
                    },
                ],
                components: [],
            });

            if (correct) {
                Functions.addSocialCredits(ctx.userData, 150);
                ctx.client.database.redis.del(`chineseNewYear2025:loseStreak_${ctx.user.id}`);
                ctx.client.database.redis.incr(`chineseNewYear2025:winStreak_${ctx.user.id}`);
            } else {
                Functions.addSocialCredits(ctx.userData, -150);
                ctx.client.database.redis.del(`chineseNewYear2025:winStreak_${ctx.user.id}`);
                ctx.client.database.redis.incr(`chineseNewYear2025:loseStreak_${ctx.user.id}`);
            }

            const loseStreak = parseInt(
                (await ctx.client.database.redis.get(
                    `chineseNewYear2025:loseStreak_${ctx.user.id}`
                )) || "0"
            );
            const winStreak = parseInt(
                (await ctx.client.database.redis.get(
                    `chineseNewYear2025:winStreak_${ctx.user.id}`
                )) || "0"
            );

            if (loseStreak >= 5 || winStreak >= 10) {
                ctx.client.database.redis.set(
                    `chineseNewYear2025:cooldown_${ctx.user.id}`,
                    String(Date.now())
                );
                ctx.client.database.redis.del(`chineseNewYear2025:winStreak_${ctx.user.id}`);
                ctx.client.database.redis.del(`chineseNewYear2025:loseStreak_${ctx.user.id}`);
            }
            if (almost) {
                ctx.interaction
                    .followUp({
                        content: `${ctx.client.localEmojis.bad_social_credit} | Almost! You got some answers right, but not all of them. You lost 150 social credits.`,
                    })
                    .catch(() => {});
            } else if (correct) {
                for (const quests of [
                    ctx.userData.daily.quests,
                    ctx.userData.chapter.quests,
                    ...ctx.userData.sideQuests.map((v) => v.quests),
                ]) {
                    for (const quest of quests.filter((r) =>
                        Functions.isAnswerChineseNewYearQuizQuest(r)
                    )) {
                        (quest as AnswerChineseNewYearQuizQuest).amount++;
                    }
                }
                ctx.interaction
                    .followUp({
                        content: `${ctx.client.localEmojis.social_credit} | 正确的！You earned 150 social credits.`,
                    })
                    .catch(() => {});
            } else {
                ctx.interaction
                    .followUp({
                        content: `${ctx.client.localEmojis.bad_social_credit} | 不正确！You lost 150 social credits.`,
                    })
                    .catch(() => {});
            }
            ctx.client.database.saveUserData(ctx.userData);
            interaction.deferUpdate().catch(() => {});

            collector.emit("end");
        });
        collector.on("end", async (interaction, reason) => {
            if (reason === "time") {
                ctx.RPGUserData = await ctx.client.database.getRPGUserData(ctx.interaction.user.id);
                Functions.addSocialCredits(ctx.userData, -150);
                ctx.client.database.redis.del(`chineseNewYear2025:winStreak_${ctx.user.id}`);
                ctx.client.database.redis.incr(`chineseNewYear2025:loseStreak_${ctx.user.id}`);
                ctx.client.database.saveUserData(ctx.userData);
                ctx.makeMessage({
                    embeds: [
                        {
                            image: {
                                url: "https://en.stgrm.com/uploads/images/social-credit-china/social-credit-china-0.webp",
                            },
                            color: 0xff0000,
                            author: {
                                name: quiz.question,
                            },
                            description: quiz.answers
                                .map((answer, i) => `${i + 1}. ${answer.answer}`)
                                .join("\n"),
                        },
                    ],
                    components: [],
                });
                await ctx.interaction.followUp({
                    content: `${ctx.client.localEmojis.social_credit} | 时间到了！(Time's Up!) You lost 150 social credits.`,
                });
            }
        });
    } else if (ctx.interaction.options.getSubcommand() === "trade") {
        if (!is2025ChineseNewYear())
            return void (await ctx.makeMessage({ content: "The event has ended." }));
        if (!ctx.userData) {
            return;
        }
        const hangbaos = () => ctx.userData.inventory[Hangbao.id] || 0;
        if (hangbaos() === 0) {
            await ctx.makeMessage({ content: "You don't have any hangbaos." });
            return;
        }
        const formattedTrades = trades.map((trade) => ({
            item: Functions.findItem(trade.item),
            amount: trade.amount,
            hasEnough: () =>
                hangbaos() >= trade.amount &&
                Functions.addItem(cloneDeep(ctx.userData), trade.item, 1),
        }));

        const getSelectMenuTrades = () =>
            formattedTrades
                .filter((trade) => trade.hasEnough())
                .map((trade) => ({
                    label: `${trade.item.name}`,
                    value: trade.item.name,
                    description: `${trade.amount.toLocaleString()} Hangbaos`,
                    emoji: trade.item.emoji,
                }));

        const selectMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "trade")
                .setPlaceholder("Select a trade")
                .addOptions(
                    getSelectMenuTrades().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getSelectMenuTrades()
                )
                .setDisabled(formattedTrades.filter((trade) => trade.hasEnough()).length === 0);

        const getOptions = () =>
            Array.from({ length: 25 }, (_, i) => i + 1)
                .map((i) => ({
                    label: `x${i} (${
                        i *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount
                    } Hangbaos)`,
                    value: i.toString(),
                }))
                .filter(
                    (i) =>
                        hangbaos() >=
                            parseInt(i.value) *
                                formattedTrades.find(
                                    (trade) => trade.item.name === currentTrade.item
                                ).amount &&
                        Functions.addItem(
                            cloneDeep(ctx.userData),
                            currentTrade.item,
                            parseInt(i.value)
                        )
                );
        const selectAnAmountMenu = () =>
            new StringSelectMenuBuilder()
                .setCustomId(ctx.interaction.id + "amount")
                .setPlaceholder("Select an amount")
                .setDisabled(getOptions().length === 0)
                .addOptions(
                    getOptions().length === 0
                        ? [{ label: "No options", value: "no" }]
                        : getOptions()
                );
        let currentTrade: { item: string; amount: number } | null = null;

        const embed = (): APIEmbed => {
            return {
                title: `Chinese New Year Trades 🐍🧧`,
                thumbnail: {
                    url: "https://media.jolyne.moe/mq6zpH/direct",
                },

                color: 0xff0000,
                description: `${
                    ctx.client.localEmojis.replyEnd
                } You have \`${hangbaos().toLocaleString()}\` hangbaos 🧧`,
                fields: [
                    ...formattedTrades.map((trade) => ({
                        name: `${trade.item.emoji} ${trade.item.name}`,
                        value: `${ctx.client.localEmojis.replyEnd} \`x${trade.amount.toLocaleString(
                            "en-US"
                        )}\` 🧧`,
                        inline: true,
                    })),
                    {
                        // blank
                        name: "\u200b",
                        value: `-# You can only have x3 copies of ${ctx.client.localEmojis.snake_jian} **Snake Jian** until the end of the event.`,
                    },
                ],
                /*thumbnail: {
                        url: "https://cdn.discordapp.com/emojis/1294731380017856715.webp?size=512",
                    },*/
            };
        };

        const goBackButton = new ButtonBuilder()
            .setCustomId(ctx.interaction.id + "goBack")
            .setLabel("Go back")
            .setEmoji("🔙")
            .setStyle(ButtonStyle.Secondary);

        const components = () => Functions.actionRow([selectMenu()]);
        await ctx.makeMessage({ embeds: [embed()], components: [components()] });

        const collector = ctx.interaction.channel.createMessageComponentCollector({
            filter: (interaction) =>
                (interaction.customId === ctx.interaction.id + "trade" ||
                    interaction.customId === ctx.interaction.id + "amount" ||
                    interaction.customId === ctx.interaction.id + "goBack") &&
                ctx.interaction.user.id === interaction.user.id,
        });

        const Timeouter = () =>
            setTimeout(() => {
                collector.stop();
            }, 60000);
        let timeouter: NodeJS.Timeout = Timeouter();

        collector.on("collect", async (interaction) => {
            clearTimeout(timeouter);
            timeouter = Timeouter();

            if (await ctx.antiCheat(true)) return;

            switch (interaction.customId) {
                case ctx.interaction.id + "trade": {
                    if (!interaction.isStringSelectMenu()) return;

                    const selectedItem = formattedTrades.find(
                        (trade) => trade.item.name === interaction.values[0]
                    );
                    if (!selectedItem) {
                        return;
                    }
                    currentTrade = {
                        item: interaction.values[0],
                        amount: null,
                    };
                    const selectAnAmountComponents = Functions.actionRow([selectAnAmountMenu()]);
                    const goBack = Functions.actionRow([goBackButton]);
                    ctx.makeMessage({
                        content: `${selectedItem.item.emoji} | You selected **${selectedItem.item.name}**.`,
                        components: [selectAnAmountComponents, goBack],
                    });
                    interaction.deferUpdate().catch(() => {});
                    break;
                }

                case ctx.interaction.id + "amount": {
                    if (!interaction.isStringSelectMenu()) return;
                    if (!currentTrade) {
                        return;
                    }
                    const selectedAmount = parseInt(interaction.values[0]); //currentTrade.amount = parseInt(interaction.values[0]);
                    const amountBought =
                        selectedAmount *
                        formattedTrades.find((trade) => trade.item.name === currentTrade.item)
                            .amount;

                    if (hangbaos() < selectedAmount) {
                        ctx.interaction.followUp({
                            content: "You don't have enough hangbaos.",
                            ephemeral: true,
                        });
                        interaction.deferUpdate().catch(() => {});
                        return;
                    }
                    const oldData = cloneDeep(ctx.userData);
                    const status: boolean[] = [
                        Functions.addItem(ctx.userData, currentTrade.item, selectedAmount),
                        Functions.removeItem(ctx.userData, Hangbao.id, amountBought),
                    ];
                    if (!status.every((s) => s)) {
                        ctx.interaction
                            .followUp({
                                content:
                                    "An error occurred. Please note that you can only have 5 copies of the event hats and 3 copies of the event weapon.",
                                ephemeral: true,
                            })
                            .catch(() => {});
                        return;
                    }
                    //ctx.client.database.saveUserData(ctx.userData);
                    const transaction = await ctx.client.database.handleTransaction(
                        [
                            {
                                oldData,
                                newData: ctx.userData,
                            },
                        ],
                        `Traded ${amountBought} hangbaos for ${selectedAmount}x ${currentTrade.item}.`,
                        status
                    );

                    ctx.interaction
                        .followUp({
                            content: `You traded ${amountBought} hangbaos for ${selectedAmount}x ${currentTrade.item} [${transaction}]`,
                            ephemeral: true,
                        })
                        .catch(() => {});
                    ctx.makeMessage({
                        content: null,
                        embeds: [embed()],
                        components: [components()],
                    }).catch(() => {});
                    break;
                }

                case ctx.interaction.id + "goBack": {
                    ctx.makeMessage({
                        content: null,
                        components: [components()],
                        embeds: [embed()],
                    });
                    interaction.deferUpdate().catch(() => {});
                    return;
                }
            }
        });

        collector.on("end", () => {
            Functions.disableRows(ctx.interaction);
        });
    } else if (ctx.interaction.options.getSubcommand() === "info") {
        const description = ChineseNewYear2025EventMessage(ctx);

        ctx.makeMessage({
            embeds: [
                {
                    color: 0xff0000,
                    title: "Chinese New Year 2025 Event 🐍🧧",
                    description,
                },
            ],
        });
    } else if (ctx.interaction.options.getSubcommand() === "progress") {
        const data = await ctx.client.database.redis.get(
            `chineseNewYear2025:highestSocialCredits_${ctx.user.id}`
        );
        const highestSocialCredits = parseInt((data !== "NaN" ? data : "1000") || "1000");
        const nextWins = [];
        for (
            let i = highestSocialCredits + 1;
            i <= ctx.userData.social_credits_2025 + 250 * 10;
            i++
        ) {
            if (i <= highestSocialCredits) continue;
            if (nextWins.length >= 3) break;
            if (i % 250 === 0) {
                if (await ctx.client.database.redis.get(`chineseNewYear2025:${i}_${ctx.user.id}`))
                    continue;
                nextWins.push(i);
            }
        }
        const nextLosses = [];
        for (let i = highestSocialCredits - 300; i !== 0.69; i--) {
            if (i >= highestSocialCredits) continue;
            if (nextLosses.length >= 3) break;
            if (i % 750 === 0) {
                if (
                    await ctx.client.database.redis.get(
                        `chineseNewYear2025:lost_${i}_${ctx.user.id}`
                    )
                )
                    continue;
                nextLosses.push(i);
            }
        }

        const message = `# ${
            ctx.client.localEmojis.social_credit
        } Social Credit Progress\n${nextLosses
            .sort((a, b) => a - b)
            .map(
                (v) =>
                    `- ${
                        ctx.client.localEmojis.doubleArrowLeft
                    } \`${v.toLocaleString()}\` social credits: Lose 2% of your ${
                        ctx.client.localEmojis.jocoins
                    } coins.`
            )
            .join(
                "\n"
            )}\n-# - 📍 You currently have **${ctx.userData.social_credits_2025.toLocaleString()}** social credits and **${
            ctx.userData.inventory.hangbao ?? 0
        }** 🧧 hangbaos\n${nextWins
            .map(
                (v) =>
                    `- ${
                        ctx.client.localEmojis.doubleArrowRight
                    } **${v.toLocaleString()}** social credits: Gain x12 🧧 hangbaos.`
            )
            .join("\n")}`;
        ctx.makeMessage({
            content: message,
        });
    }
};

export const handleInteraction = async (ctx: CommandInteractionContext): Promise<void> => {
    if (!is2025ChineseNewYear()) return;
    console.log("2025 Chinese New Year Event");

    const currentSocialCredits = ctx.userData.social_credits_2025;

    // every 250 social credits, we give to the user 20 hangbao
    const data = await ctx.client.database.redis.get(
        `chineseNewYear2025:highestSocialCredits_${ctx.user.id}`
    );
    const highestSocialCredits = parseInt((data !== "NaN" ? data : "1000") || "1000");

    const oldData = cloneDeep(ctx.userData);
    let newHigh = highestSocialCredits;

    if (highestSocialCredits < currentSocialCredits) {
        for (let i = highestSocialCredits + 1; i <= currentSocialCredits; i++) {
            if (i % 250 === 0) {
                if (await ctx.client.database.redis.get(`chineseNewYear2025:${i}_${ctx.user.id}`)) {
                    continue;
                }
                Functions.addItem(ctx.userData, "hangbao", 12);
                newHigh = i;
                console.log("gave 12 hangbao");
            }
        }
    } else {
        for (let i = highestSocialCredits - 300; i >= currentSocialCredits; i--) {
            if (i % 750 === 0) {
                if (
                    await ctx.client.database.redis.get(
                        `chineseNewYear2025:lost_${i}_${ctx.user.id}`
                    )
                ) {
                    continue;
                }
                const twoPercentOfCoins = Math.max(5000, Math.floor(ctx.userData.coins * 0.02));
                Functions.addCoins(ctx.userData, -twoPercentOfCoins);
                newHigh = i;
                console.log("lost 3% of coins");
            }
        }
    }
    if (newHigh !== highestSocialCredits) {
        console.log(newHigh, highestSocialCredits);
        await ctx.client.database.redis.set(`chineseNewYear2025:${newHigh}_${ctx.user.id}`, "true");
        await ctx.client.database.redis.set(
            `chineseNewYear2025:highestSocialCredits_${ctx.user.id}`,
            String(newHigh)
        );
        const won = newHigh > highestSocialCredits;
        const compared = Functions.getRewardsCompareData(oldData, ctx.userData);
        ctx.followUpQueue.push({
            content: `${
                won
                    ? ctx.client.localEmojis.social_credit
                    : ctx.client.localEmojis.bad_social_credit
            } | Due to the change in your social credits, you have been ${
                won ? "rewarded with" : "penalized by"
            } ${compared.join(", ")}`,
        });
        ctx.client.database.saveUserData(ctx.userData);
    }
};
