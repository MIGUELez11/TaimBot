using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace tutorialBot.Modules
{
    public class Ping : ModuleBase<SocketCommandContext>
    {
        [Command("Hola")]
        public async Task PingAsync()
        {
            await ReplyAsync("Hello World");
        }
    }
}