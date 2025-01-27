import { StringSelectMenuBuilder } from "discord.js";
import { SlashCommand } from "../../@types";
import CommandInteractionContext from "../../structures/CommandInteractionContext";
import * as Functions from "../../utils/Functions";

export const startOf2025ChineseNewYear = new Date(1738080000000);
// endOf = after 1 week
export const endOf2025ChineseNewYear = new Date(
    startOf2025ChineseNewYear.getTime() + 7 * 24 * 60 * 60 * 1000
);
export const is2025ChineseNewYear = (): boolean =>
    new Date() >= startOf2025ChineseNewYear && new Date() <= endOf2025ChineseNewYear;

export const ChineseNewYear2025EventMessage = (ctx: CommandInteractionContext): string => {
    // beast nian
    return `\`\`\`
The Chinese New Year is here! The beast Nian has come to the city and is causing chaos.
Defeat it to earn some Social Credits.
You can also earn Social Credits by using the ${ctx.client.getSlashCommandMention("event quiz")}. 
    \`\`\``;
};

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
                answer: "Gunpowder",
                correct: false,
            },
            {
                answer: "Paper",
                correct: false,
            },
            {
                answer: "Tea",
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
        question: "What is the most popular sport in China?",
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
                correct: true,
            },
            {
                answer: "No, it's terrible.",
                correct: true,
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
    if (ctx.interaction.options.getSubcommand() === "quiz") {
        const quiz =
            ChineseNewYear2025Eventquiz[
                Math.floor(Math.random() * ChineseNewYear2025Eventquiz.length)
            ];
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
            if (almost) {
                await interaction.reply({
                    content:
                        "Almost! You got some answers right, but not all of them. You lost 15 social credits.",
                });
            } else if (correct) {
                await interaction.reply({
                    content: "Correct! You earned 15 social credits.",
                });
            } else {
                await interaction.reply({
                    content: "Incorrect! You lost 15 social credits.",
                });
            }
            collector.emit("end");
        });
    }
};
