import { SlashCommandFile } from "../../@types";
import inventoryCommand from "./Inventory";

const slashCommand: SlashCommandFile = {
    data: {
        name: "item",
        description: "Use, inspect, sell, discard, or recover items",
        type: 1,
        options: [
            {
                name: "info",
                description: "Shows info about an item that you own.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to view info about.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                ],
            },
            {
                name: "use",
                description: "Uses an item. Consumes it.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to use.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "How many times do you want to use that item? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
            {
                name: "sell",
                description: "Sells an item.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to sell.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description: "How many times do you want to sell that item? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
            {
                name: "discard",
                description: "Discards an item. It can be recovered for a limited time.",
                type: 1,
                options: [
                    {
                        name: "item",
                        description: "The item you want to discard.",
                        type: 3,
                        required: true,
                        autocomplete: true,
                    },
                    {
                        name: "amount",
                        description:
                            "How many times do you want to discard that item? (default: 1)",
                        type: 4,
                        required: false,
                    },
                ],
            },
            {
                name: "recover",
                description: "Recovers an item that someone discarded.",
                type: 1,
                options: [
                    {
                        name: "id",
                        description: "The ID of the item you want to recover.",
                        type: 3,
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: inventoryCommand.execute,
    autoComplete: inventoryCommand.autoComplete,
};

export default slashCommand;
