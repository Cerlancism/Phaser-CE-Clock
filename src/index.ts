import './global'
import { Boot } from '/states'

if (module.hot)
{
    module.hot.dispose(destroyGame)
    module.hot.accept(() => console.log("[HMR]", "Accept"))
}

!(async () =>
{
    if (!window.GameInstance)
    {
        const game = window.GameInstance = await startGameAsync()
    }
})()

async function startGameAsync()
{
    return new Promise<Phaser.Game>(resolve =>
    {
        Phaser.Device.whenReady((device: Phaser.Device) =>
        {
            console.log("Device Ready")
            const isOffline = location.protocol === "file:"

            const config: Phaser.IGameConfig =
            {
                renderer: Phaser.AUTO,
                parent: 'content',
                width: window.innerWidth,
                height: window.innerHeight,
                roundPixels: true,
                backgroundColor: '#FFF',
                state: Boot
            }

            // Walkaround to prevent canvas from appearing as black from top left corner when starting the game.
            const container = document.querySelector<HTMLDivElement>("#content")
            container.style.setProperty("visibility", "hidden")

            const game = new Phaser.Game(config)

            Boot.onCreate.addOnce(() =>
            {
                container.style.removeProperty("visibility")
            })

            resolve(game)
        })
    })
}

function destroyGame()
{
    console.log("[HMR]", "Destroy Game")
    window.GameInstance.destroy()
    delete window.GameInstance
}
