/*
 * -------------------------------------------------------------------------------------------------------
 * Copyright (c) Vijay Meena <vijayymmeena@gmail.com> (https://github.com/samarmeena). All rights reserved.
 * Licensed under the Apache License. See License.txt in the project root for license information.
 * -------------------------------------------------------------------------------------------------------
 */
import { DIService } from "@discordx/di";
import type {
  AnySelectMenuInteraction,
  ApplicationCommand,
  ApplicationCommandData,
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  CommandInteractionOption,
  ContextMenuCommandInteraction,
  Interaction,
  Message,
  MessageReaction,
  ModalSubmitInteraction,
  PartialMessageReaction,
  PartialUser,
  RestEvents,
  Snowflake,
  User,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Client as ClientJS,
  InteractionType,
} from "discord.js";
import escapeRegExp from "lodash/escapeRegExp.js";
import isArray from "lodash/isArray.js";

import type {
  ApplicationCommandDataEx,
  ClientOptions,
  DApplicationCommand,
  DApplicationCommandGroup,
  DApplicationCommandOption,
  DComponent,
  DDiscord,
  DOn,
  DReaction,
  DSimpleCommand,
  DSimpleCommandOption,
  EventListenerDetail,
  GuardFunction,
  IGuild,
  ILogger,
  InitCommandOptions,
  IPrefix,
  IPrefixResolver,
  ISimpleCommandByName,
  ITriggerEventData,
  Plugin,
  SimpleCommandConfig,
} from "./index.js";
import {
  ApplicationCommandMixin,
  isApplicationCommandEqual,
  MetadataStorage,
  resolveIGuilds,
  SimpleCommandMessage,
  SimpleCommandOptionType,
  SimpleCommandParseType,
} from "./index.js";

/**
 * Extend original client class of discord.js
 *
 * @param options - Client options
 * ___
 *
 * [View Documentation](https://discordx.js.org/docs/discordx/basics/client)
 */
export class Client extends ClientJS {
  private _botId: string;
  private _isBuilt = false;
  private _isPluginsLoaded = false;
  private _prefix: IPrefixResolver;
  private _simpleCommandConfig?: SimpleCommandConfig;
  private _silent: boolean;
  private _listeners = new Map<string, EventListenerDetail[]>();
  private _botGuilds: IGuild[] = [];
  private _plugins: Plugin[] = [];
  private _guards: GuardFunction[] = [];
  private logger: ILogger;

  // static getters

  static get applicationCommandSlashesFlat(): readonly DApplicationCommand[] {
    return MetadataStorage.instance.applicationCommandSlashesFlat;
  }

  static get applicationCommandSlashes(): readonly DApplicationCommand[] {
    return MetadataStorage.instance.applicationCommandSlashes;
  }

  static get applicationCommandUsers(): readonly DApplicationCommand[] {
    return MetadataStorage.instance.applicationCommandUsers;
  }

  static get applicationCommandMessages(): readonly DApplicationCommand[] {
    return MetadataStorage.instance.applicationCommandMessages;
  }

  static get applicationCommandSlashOptions(): readonly DApplicationCommandOption[] {
    return MetadataStorage.instance.applicationCommandSlashOptions;
  }

  static get applicationCommands(): readonly DApplicationCommand[] {
    return MetadataStorage.instance.applicationCommands;
  }

  static get applicationCommandSlashGroups(): readonly DApplicationCommandGroup[] {
    return MetadataStorage.instance.applicationCommandSlashGroups;
  }

  static get applicationCommandSlashSubGroups(): readonly DApplicationCommandGroup[] {
    return MetadataStorage.instance.applicationCommandSlashSubGroups;
  }

  static get buttonComponents(): readonly DComponent[] {
    return MetadataStorage.instance.buttonComponents;
  }

  static get discords(): readonly DDiscord[] {
    return MetadataStorage.instance.discords;
  }

  static get events(): readonly DOn[] {
    return MetadataStorage.instance.events;
  }

  static get instance(): MetadataStorage {
    return MetadataStorage.instance;
  }

  static get modalComponents(): readonly DComponent[] {
    return MetadataStorage.instance.modalComponents;
  }

  static get reactions(): readonly DReaction[] {
    return MetadataStorage.instance.reactions;
  }

  static get selectMenuComponents(): readonly DComponent[] {
    return MetadataStorage.instance.selectMenuComponents;
  }

  static get simpleCommandsByName(): readonly ISimpleCommandByName[] {
    return MetadataStorage.instance.simpleCommandsByName;
  }

  static get simpleCommandMappedPrefix(): readonly string[] {
    return MetadataStorage.instance.simpleCommandMappedPrefix;
  }

  static get simpleCommands(): readonly DSimpleCommand[] {
    return MetadataStorage.instance.simpleCommands;
  }

  // map static getters

  get applicationCommandSlashes(): readonly DApplicationCommand[] {
    return Client.applicationCommandSlashes;
  }

  get applicationCommandSlashesFlat(): readonly DApplicationCommand[] {
    return Client.applicationCommandSlashesFlat;
  }

  get applicationCommandSlashOptions(): readonly DApplicationCommandOption[] {
    return Client.applicationCommandSlashOptions;
  }

  get applicationCommandSlashGroups(): readonly DApplicationCommandGroup[] {
    return Client.applicationCommandSlashGroups;
  }

  get applicationCommandSlashSubGroups(): readonly DApplicationCommandGroup[] {
    return Client.applicationCommandSlashSubGroups;
  }

  get applicationCommandUsers(): readonly DApplicationCommand[] {
    return Client.applicationCommandUsers;
  }

  get applicationCommandMessages(): readonly DApplicationCommand[] {
    return Client.applicationCommandMessages;
  }

  get applicationCommands(): readonly DApplicationCommand[] {
    return Client.applicationCommands;
  }

  get buttonComponents(): readonly DComponent[] {
    return Client.buttonComponents;
  }

  get discords(): readonly DDiscord[] {
    return Client.discords;
  }

  get events(): readonly DOn[] {
    return Client.events;
  }

  get instance(): MetadataStorage {
    return Client.instance;
  }

  get modalComponents(): readonly DComponent[] {
    return Client.modalComponents;
  }

  get reactions(): readonly DReaction[] {
    return Client.reactions;
  }

  get selectMenuComponents(): readonly DComponent[] {
    return Client.selectMenuComponents;
  }

  get simpleCommandsByName(): readonly ISimpleCommandByName[] {
    return Client.simpleCommandsByName;
  }

  get simpleCommandMappedPrefix(): readonly string[] {
    return Client.simpleCommandMappedPrefix;
  }

  get simpleCommands(): readonly DSimpleCommand[] {
    return Client.simpleCommands;
  }

  // client getters

  get botResolvedGuilds(): Promise<string[]> {
    return resolveIGuilds(this, undefined, this._botGuilds);
  }

  get botGuilds(): IGuild[] {
    return this._botGuilds;
  }

  set botGuilds(value: IGuild[]) {
    this._botGuilds = value;
  }

  get botId(): string {
    return this._botId;
  }

  set botId(value: string) {
    this._botId = value;
  }

  get guards(): GuardFunction[] {
    return this._guards;
  }

  set guards(value: GuardFunction[]) {
    this._guards = value;
  }

  get prefix(): IPrefixResolver {
    return this._prefix;
  }

  set prefix(value: IPrefixResolver) {
    this._prefix = value;
  }

  get simpleCommandConfig(): SimpleCommandConfig | undefined {
    return this._simpleCommandConfig;
  }

  set simpleCommandConfig(value: SimpleCommandConfig | undefined) {
    this._simpleCommandConfig = value;
  }

  get silent(): boolean {
    return this._silent;
  }

  set silent(value: boolean) {
    this._silent = value;
  }

  /**
   * Extend original client class of discord.js
   *
   * @param options - Client options
   * ___
   *
   * [View Documentation](https://discordx.js.org/docs/discordx/basics/client)
   */
  constructor(options: ClientOptions) {
    super(options);

    this._plugins = options.plugins ?? [];
    this._silent = options.silent ?? true;
    this.guards = options.guards ?? [];
    this.botGuilds = options.botGuilds ?? [];
    this._botId = options.botId ?? "bot";
    this._prefix = options.simpleCommand?.prefix ?? ["!"];
    this._simpleCommandConfig = options.simpleCommand;
    this.logger = options.logger ?? console;
  }

  /**
   * Start bot
   *
   * @param token - Bot token
   */
  async login(token: string): Promise<string> {
    await this.build();

    if (!this.silent) {
      this.logger.log(
        `${this.user?.username ?? this.botId} >> connecting discord...\n`,
      );
    }

    return super.login(token);
  }

  /**
   * Print information about all events and commands to your console
   */
  printDebug(): void {
    if (!this.instance.isBuilt) {
      this.logger.error(
        "Build the app before running this method with client.build()",
      );
      return;
    }

    this.logger.log("client >> Events");
    if (this.events.length) {
      this.events.forEach((event) => {
        const eventName = event.event;
        const className: string = event.classRef.name;
        const key: string = event.key;
        this.logger.log(`>> ${eventName} (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo event detected");
    }

    this.logger.log("");

    this.logger.log("client >> buttons");

    if (this.buttonComponents.length) {
      this.buttonComponents.forEach((btn) => {
        const className: string = btn.classRef.name;
        const key: string = btn.key;
        this.logger.log(`>> ${btn.id.toString()} (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo buttons detected");
    }

    this.logger.log("");

    this.logger.log("client >> select menu's");

    if (this.selectMenuComponents.length) {
      this.selectMenuComponents.forEach((menu) => {
        const className: string = menu.classRef.name;
        const key: string = menu.key;
        this.logger.log(`>> ${menu.id.toString()} (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo select menu detected");
    }

    this.logger.log("");

    this.logger.log("client >> modals");

    if (this.modalComponents.length) {
      this.modalComponents.forEach((menu) => {
        const className: string = menu.classRef.name;
        const key: string = menu.key;
        this.logger.log(`>> ${menu.id.toString()} (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo modal detected");
    }

    this.logger.log("");

    this.logger.log("client >> reactions");

    if (this.reactions.length) {
      this.reactions.forEach((menu) => {
        const className: string = menu.classRef.name;
        const key: string = menu.key;
        this.logger.log(`>> ${menu.emoji} (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo reaction detected");
    }

    this.logger.log("");

    this.logger.log("client >> context menu's");

    const contexts = [
      ...this.applicationCommandUsers,
      ...this.applicationCommandMessages,
    ];

    if (contexts.length) {
      contexts.forEach((menu) => {
        const type = menu.type.toString();
        const className: string = menu.classRef.name;
        const key: string = menu.key;
        this.logger.log(`>> ${menu.name} (${type}) (${className}.${key})`);
      });
    } else {
      this.logger.log("\tNo context menu detected");
    }

    this.logger.log("");

    this.logger.log("client >> application commands");
    if (this.applicationCommands.length) {
      this.applicationCommands.forEach((DCommand, index) => {
        if (DCommand.botIds.length && !DCommand.botIds.includes(this.botId)) {
          return;
        }

        const line = index !== 0 ? "\n" : "";
        const className: string = DCommand.classRef.name;
        const key: string = DCommand.key;
        this.logger.log(`${line}\t>> ${DCommand.name} (${className}.${key})`);

        /**
         * Print options
         *
         * @param options
         * @param depth
         * @returns
         */
        const printOptions = (
          options: DApplicationCommandOption[],
          depth: number,
        ) => {
          const tab = Array(depth).join("\t\t");

          options.forEach((option, optionIndex) => {
            const className: string = option.classRef.name;
            const key: string = option.key;

            this.logger.log(
              `${
                (option.type === ApplicationCommandOptionType.Subcommand ||
                  option.type ===
                    ApplicationCommandOptionType.SubcommandGroup) &&
                optionIndex !== 0
                  ? "\n"
                  : ""
              }${tab}>> ${
                option.type === ApplicationCommandOptionType.Subcommand ||
                option.type === ApplicationCommandOptionType.SubcommandGroup
                  ? option.name
                  : option.name
              }: ${ApplicationCommandOptionType[option.type].toLowerCase()} (${
                className
              }.${key})`,
            );
            printOptions(option.options, depth + 1);
          });
        };

        printOptions(DCommand.options, 2);
      });
    } else {
      this.logger.log("\tNo application command detected");
    }

    this.logger.log("");

    this.logger.log("client >> simple commands");
    if (this.simpleCommands.length) {
      this.simpleCommands.forEach((cmd) => {
        const className: string = cmd.classRef.name;
        const key: string = cmd.key;
        this.logger.log(`\t>> ${cmd.name} (${className}.${key})`);
        if (cmd.aliases.length) {
          this.logger.log(`\t\taliases:`, cmd.aliases.join(", "));
        }

        /**
         * Print options
         *
         * @param options
         * @param depth
         * @returns
         */
        const printOptions = (
          options: DSimpleCommandOption[],
          depth: number,
        ) => {
          const tab = Array(depth).join("\t\t");
          options.forEach((option) => {
            const type = SimpleCommandOptionType[option.type];
            const className: string = option.classRef.name;
            const key: string = option.key;
            this.logger.log(
              `${tab}${option.name}: ${type} (${className}.${key})`,
            );
          });
        };

        printOptions(cmd.options, 2);
        this.logger.log("");
      });
    } else {
      this.logger.log("\tNo simple command detected");
    }

    this.logger.log("\n");
  }

  /**
   * Get commands mapped by guild id (in case of multi bot, commands are filtered for this client only)
   * @returns
   */
  async CommandByGuild(): Promise<Map<string, DApplicationCommand[]>> {
    const botResolvedGuilds = await this.botResolvedGuilds;

    // # group guild commands by guildId
    const guildDCommandStore = new Map<Snowflake, DApplicationCommand[]>();
    const allGuildDCommands = this.applicationCommands.filter(
      (DCommand) =>
        DCommand.isBotAllowed(this.botId) &&
        [...botResolvedGuilds, ...DCommand.guilds].length,
    );

    // group single guild commands together
    await Promise.all(
      allGuildDCommands.map(async (DCommand) => {
        const guilds = await resolveIGuilds(this, DCommand, [
          ...botResolvedGuilds,
          ...DCommand.guilds,
        ]);

        guilds.forEach((guild) =>
          guildDCommandStore.set(guild, [
            ...(guildDCommandStore.get(guild) ?? []),
            DCommand,
          ]),
        );
      }),
    );

    return guildDCommandStore;
  }

  /**
   * Initialize all the @Slash
   */
  async initApplicationCommands(options?: {
    global?: InitCommandOptions;
    guild?: InitCommandOptions;
  }): Promise<void> {
    const allGuildPromises: Promise<void>[] = [];
    const guildDCommandStore = await this.CommandByGuild();

    // run task to add/update/delete slashes for guilds
    guildDCommandStore.forEach((DCommands, guildId) => {
      // If bot is not in guild, skip it
      const guild = this.guilds.cache.get(guildId);
      if (!guild) {
        return;
      }

      allGuildPromises.push(
        this.initGuildApplicationCommands(guildId, DCommands, options?.guild),
      );
    });

    await Promise.all([
      Promise.all(allGuildPromises),
      this.initGlobalApplicationCommands(options?.global),
    ]);
  }

  /**
   * Init application commands for guild
   * @param guildId - Guild identifier
   * @param DCommands - Array of commands
   * @param options - Options
   */
  async initGuildApplicationCommands(
    guildId: string,
    DCommands: DApplicationCommand[],
    options?: InitCommandOptions,
  ): Promise<void> {
    const botResolvedGuilds = await this.botResolvedGuilds;

    const guild = this.guilds.cache.get(guildId);
    if (!guild) {
      this.logger.warn(
        `${
          this.user?.username ?? this.botId
        } >> initGuildApplicationCommands: skipped (Reason: guild ${guildId} unavailable)`,
      );
      return;
    }

    // fetch already registered application command
    const ApplicationCommands = await guild.commands.fetch({
      withLocalizations: true,
    });

    // filter only unregistered application command
    const commandsToAdd = DCommands.filter(
      (DCommand) =>
        !ApplicationCommands.find(
          (cmd) => cmd.name === DCommand.name && cmd.type === DCommand.type,
        ),
    );

    // filter application command to update

    const commandsToUpdate: ApplicationCommandMixin[] = [];
    const commandsToSkip: ApplicationCommandMixin[] = [];

    DCommands.forEach((DCommand) => {
      const findCommand = ApplicationCommands.find(
        (cmd) => cmd.name === DCommand.name && cmd.type === DCommand.type,
      );

      if (!findCommand) {
        return;
      }

      if (!isApplicationCommandEqual(findCommand, DCommand, true)) {
        commandsToUpdate.push(
          new ApplicationCommandMixin(findCommand, DCommand),
        );
      } else {
        commandsToSkip.push(new ApplicationCommandMixin(findCommand, DCommand));
      }
    });

    // filter commands to delete
    const commandsToDelete: ApplicationCommand[] = [];
    await Promise.all(
      ApplicationCommands.map(async (cmd) => {
        const DCommandFind = DCommands.find(
          (DCommand) =>
            DCommand.name === cmd.name && DCommand.type === cmd.type,
        );

        // delete command if it's not found
        if (!DCommandFind) {
          commandsToDelete.push(cmd);
          return;
        }

        const guilds = await resolveIGuilds(this, DCommandFind, [
          ...botResolvedGuilds,
          ...DCommandFind.guilds,
        ]);

        // delete command if it's not registered for given guild
        if (!cmd.guildId || !guilds.includes(cmd.guildId)) {
          commandsToDelete.push(cmd);
        }
      }),
    );

    // log the changes to commands if enabled by options or silent mode is turned off
    if (!this.silent) {
      let str = `${this.user?.username ?? "Bot"} >> commands >> guild: #${guild.toString()}`;

      str += `\n\t>> adding   ${String(commandsToAdd.length)} [${commandsToAdd
        .map((DCommand) => DCommand.name)
        .join(", ")}] ${options?.disable?.add ? "[task disabled]" : ""}`;

      str += `\n\t>> updating ${String(commandsToUpdate.length)} [${commandsToUpdate
        .map((cmd) => cmd.command.name)
        .join(", ")}] ${options?.disable?.update ? "[task disabled]" : ""}`;

      str += `\n\t>> deleting ${String(commandsToDelete.length)} [${commandsToDelete
        .map((cmd) => cmd.name)
        .join(", ")}] ${options?.disable?.delete ? "[task disabled]" : ""}`;

      str += `\n\t>> skipping ${String(commandsToSkip.length)} [${commandsToSkip
        .map((cmd) => cmd.name)
        .join(", ")}]`;

      str += "\n";

      this.logger.log(str);
    }

    // If there are no changes to share with Discord, cancel the task
    if (
      commandsToAdd.length +
        commandsToUpdate.length +
        commandsToDelete.length ===
      0
    ) {
      return;
    }

    // perform bulk update with discord using set operation
    const bulkUpdate: ApplicationCommandDataEx[] = [];

    const operationToSkip = commandsToSkip.map((cmd) =>
      bulkUpdate.push(cmd.instance.toJSON()),
    );

    const operationToAdd = options?.disable?.add
      ? []
      : commandsToAdd.map((DCommand) => bulkUpdate.push(DCommand.toJSON()));

    const operationToUpdate = options?.disable?.update
      ? commandsToUpdate.map(async (cmd) =>
          bulkUpdate.push(
            (await cmd.command.toJSON()) as ApplicationCommandDataEx,
          ),
        )
      : commandsToUpdate.map((cmd) => bulkUpdate.push(cmd.instance.toJSON()));

    const operationToDelete = options?.disable?.delete
      ? commandsToDelete.map(async (cmd) =>
          bulkUpdate.push((await cmd.toJSON()) as ApplicationCommandDataEx),
        )
      : [];

    await Promise.all([
      // skipped
      ...operationToSkip,

      // add
      ...operationToAdd,

      // update
      ...operationToUpdate,

      // delete
      ...operationToDelete,
    ]);

    await guild.commands.set(bulkUpdate as ApplicationCommandData[]);
  }

  /**
   * Init global application commands
   *
   * @param options - Options
   */
  async initGlobalApplicationCommands(
    options?: InitCommandOptions,
  ): Promise<void> {
    const botResolvedGuilds = await this.botResolvedGuilds;

    if (!this.application) {
      throw Error(
        "The client is not yet ready, connect to discord before fetching commands",
      );
    }

    // # initialize add/update/delete task for global commands
    const ApplicationCommands = (
      await this.application.commands.fetch()
    ).filter((cmd) => !cmd.guild);

    const DCommands = this.applicationCommands.filter(
      (DCommand) =>
        ![...botResolvedGuilds, ...DCommand.guilds].length &&
        (!DCommand.botIds.length || DCommand.botIds.includes(this.botId)),
    );

    const commandsToAdd = DCommands.filter(
      (DCommand) =>
        !ApplicationCommands.find(
          (cmd) => cmd.name === DCommand.name && cmd.type === DCommand.type,
        ),
    );

    const commandsToUpdate: ApplicationCommandMixin[] = [];
    const commandsToSkip: ApplicationCommandMixin[] = [];

    DCommands.forEach((DCommand) => {
      const findCommand = ApplicationCommands.find(
        (cmd) => cmd.name === DCommand.name && cmd.type === DCommand.type,
      );

      if (!findCommand) {
        return;
      }

      if (!isApplicationCommandEqual(findCommand, DCommand)) {
        commandsToUpdate.push(
          new ApplicationCommandMixin(findCommand, DCommand),
        );
      } else {
        commandsToSkip.push(new ApplicationCommandMixin(findCommand, DCommand));
      }
    });

    const commandsToDelete = ApplicationCommands.filter((cmd) =>
      DCommands.every(
        (DCommand) => DCommand.name !== cmd.name || DCommand.type !== cmd.type,
      ),
    );

    // log the changes to commands if enabled by options or silent mode is turned off
    if (!this.silent) {
      let str = `${this.user?.username ?? this.botId} >> commands >> global`;

      str += `\n\t>> adding   ${String(commandsToAdd.length)} [${commandsToAdd
        .map((DCommand) => DCommand.name)
        .join(", ")}] ${options?.disable?.add ? "[task disabled]" : ""}`;

      str += `\n\t>> updating ${String(commandsToUpdate.length)} [${commandsToUpdate
        .map((cmd) => cmd.command.name)
        .join(", ")}] ${options?.disable?.update ? "[task disabled]" : ""}`;

      str += `\n\t>> deleting ${String(commandsToDelete.size)} [${commandsToDelete
        .map((cmd) => cmd.name)
        .join(", ")}] ${options?.disable?.delete ? "[task disabled]" : ""}`;

      str += `\n\t>> skipping ${String(commandsToSkip.length)} [${commandsToSkip
        .map((cmd) => cmd.name)
        .join(", ")}]`;

      str += "\n";

      this.logger.log(str);
    }

    // If there are no changes to share with Discord, cancel the task
    if (
      commandsToAdd.length + commandsToUpdate.length + commandsToDelete.size ===
      0
    ) {
      return;
    }

    // perform bulk update with discord using set operation
    const bulkUpdate: ApplicationCommandDataEx[] = [];

    const operationToSkip = commandsToSkip.map((cmd) =>
      bulkUpdate.push(cmd.instance.toJSON()),
    );

    const operationToAdd = options?.disable?.add
      ? []
      : commandsToAdd.map((DCommand) => bulkUpdate.push(DCommand.toJSON()));

    const operationToUpdate = options?.disable?.update
      ? commandsToUpdate.map((cmd) =>
          bulkUpdate.push(cmd.command.toJSON() as ApplicationCommandDataEx),
        )
      : commandsToUpdate.map((cmd) => bulkUpdate.push(cmd.instance.toJSON()));

    const operationToDelete = options?.disable?.delete
      ? commandsToDelete.map((cmd) =>
          bulkUpdate.push(cmd.toJSON() as ApplicationCommandDataEx),
        )
      : [];

    await Promise.all([
      // skipped
      ...operationToSkip,

      // add
      ...operationToAdd,

      // update
      ...operationToUpdate,

      // delete
      ...operationToDelete,
    ]);

    await this.application.commands.set(bulkUpdate as ApplicationCommandData[]);
  }

  /**
   * Clear the application commands globally or for some guilds
   *
   * @param guilds - The guild Ids (empty -> globally)
   */
  async clearApplicationCommands(...guilds: Snowflake[]): Promise<void> {
    if (guilds.length) {
      await Promise.all(
        // Select and delete the commands of each guild
        guilds.map((guild) => this.guilds.cache.get(guild)?.commands.set([])),
      );
    } else {
      await this.application?.commands.set([]);
    }
  }

  /**
   * Get the group tree of an slash interaction
   * /hello => ["hello"]
   * /test hello => ["test", "hello"]
   * /test hello me => ["test", "hello", "me"]
   *
   * @param interaction - The targeted slash interaction
   *
   * @returns
   */
  getApplicationCommandGroupTree(
    interaction: CommandInteraction | AutocompleteInteraction,
  ): string[] {
    const tree: string[] = [];

    /**
     * Get options tree
     *
     * @param option
     * @returns
     */
    const getOptionsTree = (
      option: Partial<CommandInteractionOption> | undefined,
    ): void => {
      if (!option) {
        return;
      }

      if (
        !option.type ||
        option.type === ApplicationCommandOptionType.SubcommandGroup ||
        option.type === ApplicationCommandOptionType.Subcommand
      ) {
        if (option.name) {
          tree.push(option.name);
        }

        getOptionsTree(Array.from(option.options?.values() ?? [])[0]);
      }
    };

    getOptionsTree({
      name: interaction.commandName,
      options: Array.from(interaction.options.data.values()),
      type: undefined,
    });

    return tree;
  }

  /**
   * Return the corresponding @Slash from a tree
   *
   * @param tree - Array of string
   *
   * @returns
   */
  getApplicationCommandFromTree(
    tree: string[],
  ): DApplicationCommand | undefined {
    // Find the corresponding @Slash
    return this.applicationCommandSlashesFlat.find((slash) => {
      switch (tree.length) {
        case 1:
          // Simple command /hello
          return (
            slash.group === undefined &&
            slash.subgroup === undefined &&
            slash.name === tree[0] &&
            slash.type === ApplicationCommandType.ChatInput
          );

        case 2:
          // Simple grouped command
          // /permission user perm
          return (
            slash.group === tree[0] &&
            slash.subgroup === undefined &&
            slash.name === tree[1] &&
            slash.type === ApplicationCommandType.ChatInput
          );

        case 3:
          // Grouped and subgrouped command
          // /permission user perm
          return (
            slash.group === tree[0] &&
            slash.subgroup === tree[1] &&
            slash.name === tree[2] &&
            slash.type === ApplicationCommandType.ChatInput
          );

        default:
          return false;
      }
    });
  }

  /**
   * Execute all types of interaction
   *
   * @param interaction - Interaction
   *
   * @returns
   */
  executeInteraction(interaction: Interaction): Awaited<unknown> {
    // if interaction is a button
    if (interaction.isButton()) {
      return this.executeComponent(this.buttonComponents, interaction);
    }

    // if interaction is a modal
    if (interaction.type === InteractionType.ModalSubmit) {
      return this.executeComponent(this.modalComponents, interaction);
    }

    // if interaction is a select menu
    if (interaction.isAnySelectMenu()) {
      return this.executeComponent(this.selectMenuComponents, interaction);
    }

    // if interaction is context menu
    if (interaction.isContextMenuCommand()) {
      return this.executeContextMenu(interaction);
    }

    // If interaction is slash command
    return this.executeCommandInteraction(interaction);
  }

  /**
   * Execute command interaction
   *
   * @param interaction - Interaction instance
   *
   * @returns
   */
  async executeCommandInteraction(
    interaction: CommandInteraction | AutocompleteInteraction,
  ): Promise<unknown> {
    // Get the interaction group tree
    const tree = this.getApplicationCommandGroupTree(interaction);
    const applicationCommand = this.getApplicationCommandFromTree(tree);

    if (!applicationCommand?.isBotAllowed(this.botId)) {
      if (!this.silent) {
        this.logger.warn(
          `${
            this.user?.username ?? this.botId
          } >> interaction not found, commandName: ${interaction.commandName}`,
        );
      }
      return null;
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const focusOption = interaction.options.getFocused(true);
      const option = applicationCommand.options.find(
        (op) => op.name === focusOption.name,
      );

      if (option && typeof option.autocomplete === "function") {
        await option.autocomplete.call(
          DIService.engine.getService(option.from),
          interaction,
          applicationCommand,
        );
        return null;
      }
    }

    // Parse the options values and inject it into the @Slash method
    return applicationCommand.execute(this.guards, interaction, this);
  }

  /**
   * Execute component interaction
   *
   * @param interaction - Interaction instance
   *
   * @returns
   */
  async executeComponent(
    components: readonly DComponent[],
    interaction:
      | ButtonInteraction
      | ModalSubmitInteraction
      | AnySelectMenuInteraction,
  ): Promise<unknown> {
    const executes = components.filter(
      (component) =>
        component.isId(interaction.customId) &&
        component.isBotAllowed(this.botId),
    );

    if (!executes.length) {
      if (!this.silent) {
        this.logger.warn(
          `${this.user?.username ?? this.botId} >> ${
            interaction.isButton()
              ? "button"
              : interaction.isAnySelectMenu()
                ? "select menu"
                : "modal"
          } component handler not found, interactionId: ${
            interaction.id
          } | customId: ${interaction.customId}`,
        );
      }

      return null;
    }

    const results = await Promise.all(
      executes.map(async (component) => {
        if (!(await component.isGuildAllowed(this, interaction.guildId))) {
          return null;
        }

        return component.execute(this.guards, interaction, this);
      }),
    );

    return results;
  }

  /**
   * Execute context menu interaction
   *
   * @param interaction - Interaction instance
   *
   * @returns
   */
  executeContextMenu(
    interaction: ContextMenuCommandInteraction,
  ): Awaited<unknown> {
    const applicationCommand = interaction.isUserContextMenuCommand()
      ? this.applicationCommandUsers.find(
          (cmd) => cmd.name === interaction.commandName,
        )
      : this.applicationCommandMessages.find(
          (cmd) => cmd.name === interaction.commandName,
        );

    if (!applicationCommand?.isBotAllowed(this.botId)) {
      if (!this.silent) {
        this.logger.warn(
          `${
            this.user?.username ?? this.botId
          } >> context interaction not found, name: ${interaction.commandName}`,
        );
      }
      return null;
    }

    return applicationCommand.execute(this.guards, interaction, this);
  }

  /**
   * Fetch prefix for message
   *
   * @param message - Message instance
   *
   * @returns
   */
  async getMessagePrefix(message: Message): Promise<IPrefix> {
    if (typeof this.prefix !== "function") {
      return isArray(this.prefix) ? [...this.prefix] : [this.prefix];
    }

    return [...(await this.prefix(message))];
  }

  /**
   * Parse command message
   *
   * @param prefix - Command prefix
   * @param message - Original message
   * @param caseSensitive - Execute case-sensitively
   *
   * @returns
   */
  async parseCommand(
    prefix: IPrefix,
    message: Message,
    caseSensitive = false,
  ): Promise<SimpleCommandParseType | SimpleCommandMessage> {
    /**
     * Get a regular expression for the prefix by combining unique simple command prefixes.
     */
    const prefixRegex = RegExp(
      `^(${[...prefix, ...this.simpleCommandMappedPrefix]
        .map((pfx) => escapeRegExp(pfx))
        .join("|")})`,
    );

    /**
     * Perform regex test on the message to determine if it qualifies as a command or not.
     */
    const isCommand = prefixRegex.test(message.content);
    if (!isCommand) {
      return SimpleCommandParseType.notCommand;
    }

    /**
     * Get matched prefix from regular expression
     */
    const matchedPrefix = prefixRegex.exec(message.content)?.at(1) ?? "unknown";

    /**
     * Message content without prefix
     */
    const contentWithoutPrefix = `${message.content
      .replace(prefixRegex, "")
      .trim()} `;

    /**
     * Find command by name
     */
    const commandRaw = this.simpleCommandsByName.find((cmd) => {
      if (caseSensitive) {
        return contentWithoutPrefix.startsWith(`${cmd.name} `);
      }

      return contentWithoutPrefix
        .toLowerCase()
        .startsWith(`${cmd.name.toLowerCase()} `);
    });

    /**
     * Return not found if command is not found
     */
    if (!commandRaw) {
      return SimpleCommandParseType.notFound;
    }

    /**
     * Prepare arguments without command name
     */
    const commandArgs = contentWithoutPrefix
      .replace(new RegExp(commandRaw.name, "i"), "")
      .trim();

    /**
     * Prepare simple command message instance
     */
    const command = new SimpleCommandMessage(
      matchedPrefix,
      commandArgs,
      message,
      commandRaw.command,
      this.simpleCommandConfig?.argSplitter,
    );

    /**
     * Resolve command options
     */
    command.options = await command.resolveOptions();

    return command;
  }

  /**
   * Execute the corresponding @SimpleCommand based on an message instance
   *
   * @param message - Message instance
   * @param options - Options
   *
   * @returns
   */
  async executeCommand(
    message: Message,
    caseSensitive?: boolean,
  ): Promise<unknown> {
    /**
     * Get prefix for message
     */
    const prefix = await this.getMessagePrefix(message);

    /**
     * Parse command
     */
    const command = await this.parseCommand(
      prefix,
      message,
      caseSensitive ?? false,
    );

    /**
     * Return if the message is not a command
     */
    if (command === SimpleCommandParseType.notCommand) {
      return null;
    }

    /**
     * Return error for not found command
     */
    if (command === SimpleCommandParseType.notFound) {
      const handleNotFound = this.simpleCommandConfig?.responses?.notFound;
      if (handleNotFound) {
        if (typeof handleNotFound === "string") {
          await message.reply(handleNotFound);
        } else {
          await handleNotFound(message);
        }
      }
      return null;
    }

    /**
     * Validate bot id
     */
    if (!command.info.isBotAllowed(this.botId)) {
      return null;
    }

    /**
     * Validate guild id
     */
    if (!(await command.info.isGuildAllowed(this, command, message.guildId))) {
      return null;
    }

    /**
     * Check if DM is allowed and if guild is present in message
     */
    if (!command.info.directMessage && !message.guild) {
      return null;
    }

    return command.info.execute(this.guards, command, this);
  }

  /**
   * Parse reaction
   *
   * @param message - Original reaction
   *
   * @returns
   */
  parseReaction(
    message: MessageReaction | PartialMessageReaction,
  ): DReaction | undefined {
    const reaction = this.reactions.find((react) => {
      const validNames = [react.emoji, ...react.aliases];
      const { emoji } = message;

      return (
        (emoji.id ? validNames.includes(emoji.id) : false) ||
        (emoji.name ? validNames.includes(emoji.name) : false)
      );
    });

    return reaction;
  }

  /**
   * Execute the corresponding @Reaction based on an message reaction instance
   *
   * @param reaction - MessageReaction instance
   * @param options - Options
   *
   * @returns
   */
  async executeReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): Promise<unknown> {
    const action = this.parseReaction(reaction);
    if (!action) {
      return null;
    }

    // validate bot id
    if (!action.isBotAllowed(this.botId)) {
      return null;
    }

    // validate guild id
    if (!(await action.isGuildAllowed(this, reaction.message.guildId))) {
      return null;
    }

    // check dm allowed or not
    if (!action.directMessage && !reaction.message.guild) {
      return null;
    }

    // fetch reaction or user if partial is not enabled
    if (!action.partial && reaction.partial) {
      reaction = await reaction.fetch();
    }

    if (!action.partial && user.partial) {
      user = await user.fetch();
    }

    // remove reaction if remove is enabled
    if (action.remove) {
      await reaction.users.remove(user.id);
    }

    return action.execute(this.guards, reaction, user, this);
  }

  /**
   * Trigger an event manually (used for testing)
   *
   * @param options - Event data
   * @param params - Params to inject
   *
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  trigger(options: ITriggerEventData, params: any): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.instance.trigger(options)(params);
  }

  /**
   * Load plugins
   */
  async initPlugins(): Promise<void> {
    if (this._isPluginsLoaded) {
      return;
    }

    this._isPluginsLoaded = true;
    await Promise.all(this._plugins.map((plugin) => plugin.init(this)));
  }

  /**
   * Bind discordx events to client
   */
  initEvents(): void {
    for (const event of this.instance.usedEvents) {
      const trigger = this.instance.trigger({
        client: this,
        event: event.event,
        guards: this.guards,
        once: event.once,
        rest: event.rest,
      });

      if (!this._listeners.has(event.event)) {
        this._listeners.set(event.event, []);
      }

      this._listeners
        .get(event.event)
        ?.push({ once: event.once, rest: event.rest, trigger });

      if (event.rest) {
        event.once
          ? this.rest.once(event.event as keyof RestEvents, trigger)
          : this.rest.on(event.event as keyof RestEvents, trigger);
      } else {
        event.once
          ? this.once(event.event, trigger)
          : this.on(event.event, trigger);
      }
    }
  }

  /**
   * Unbind all Discordx events initialized by the initEvents method.
   */
  removeEvents(): void {
    this._listeners.forEach((listenerDetails, event) => {
      listenerDetails.forEach(({ once, rest, trigger }) => {
        if (rest) {
          once
            ? this.rest.off(event as keyof RestEvents, trigger)
            : this.rest.removeListener(event as keyof RestEvents, trigger);
        } else {
          once ? this.off(event, trigger) : this.removeListener(event, trigger);
        }
      });
    });

    // Clear the listeners map after removing all listeners
    this._listeners.clear();
  }

  /**
   * Manually build client
   */
  async build(): Promise<void> {
    if (this._isBuilt) {
      return;
    }

    this._isBuilt = true;

    // Load plugins
    await this.initPlugins();

    // Build instance
    await this.instance.build();

    // Bind events
    this.initEvents();

    // Print logs
    if (!this.silent) {
      this.printDebug();
    }
  }
}
