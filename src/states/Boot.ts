function getMinGameWidthOrHeight()
{
    const { width, height } = GameInstance.world
    return Math.min(width, height);
}

function hourToAngle(value: number)
{
    return overFlowAngle(360 / 12 * (value % 12))
}

function minuteOrSecondToAngle(value: number)
{
    return overFlowAngle(360 / 60 * (value % 60))
}

function overFlowAngle(value: number)
{
    if (value > 180)
    {
        return -180 + (value - 180)
    }
    return value
}

const ReferenceLength = 1080

export class Boot extends Phaser.State
{
    public static onCreate = new Phaser.Signal()

    referenceLength: number

    circleTexture: Phaser.RenderTexture;
    circleDotTexture: Phaser.RenderTexture;
    hourHandTexture: Phaser.RenderTexture;
    minuteHandTexture: Phaser.RenderTexture;
    secondHandTexture: Phaser.RenderTexture;

    clockBody: Phaser.Sprite;
    clockObject: Phaser.Group;
    timeStamp: Phaser.Text;
    hourHand: Phaser.Sprite;
    minuteHand: Phaser.Sprite;
    secondHand: Phaser.Sprite;

    constructor()
    {
        super()
    }

    init()
    {
        this.game.stage.disableVisibilityChange = true
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE
        this.referenceLength = getMinGameWidthOrHeight()
    }

    preload()
    {
        this.circleTexture = new Phaser.Graphics(this.game)
            .lineStyle(10, 0, 1)
            .drawCircle(0, 0, 800)
            .generateTexture()

        this.circleDotTexture = new Phaser.Graphics(this.game)
            .beginFill(0xFF00000)
            .drawCircle(0, 0, 30)
            .endFill()
            .generateTexture()

        this.hourHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0x444444)
            .drawRect(0, 0, 30, 250)
            .endFill()
            .generateTexture()

        this.minuteHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0)
            .drawRect(0, 0, 20, 400)
            .endFill()
            .generateTexture()

        this.secondHandTexture = new Phaser.Graphics(this.game)
            .beginFill(0xFF0000)
            .drawRect(0, 0, 10, 450)
            .endFill()
            .generateTexture()
    }

    create()
    {
        Boot.onCreate.dispatch()

        this.clockObject = this.add.group(this.world, "clock")

        this.clockBody = this.createClockComponent(Phaser.Sprite, 0, 0, this.circleTexture)
        this.clockBody.anchor.set(0.5)
        this.clockBody.y -= 100

        this.hourHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.hourHandTexture)
        this.hourHand.anchor.set(0.5, 0.8)

        this.minuteHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.minuteHandTexture)
        this.minuteHand.anchor.set(0.5, 0.8)

        this.secondHand = this.createClockComponent(Phaser.Sprite, this.clockBody.x, this.clockBody.y, this.secondHandTexture)
        this.secondHand.anchor.set(0.5, 0.8)

        this.timeStamp = this.createClockComponent(Phaser.Text, 0, 0)
        this.timeStamp.anchor.set(0.5)
        this.timeStamp.fontSize = 64
        this.timeStamp.y = 400

        const clockDot = this.createClockComponent(Phaser.Sprite, 0, 0, this.circleDotTexture)
        clockDot.anchor.set(0.5)
        clockDot.position = this.clockBody.position

        this.secondHand.angle = minuteOrSecondToAngle(new Date().getSeconds())

        this.handleScale()
        this.updateClock()
        this.time.events.repeat(1000, Infinity, () => this.updateClock())
    }

    createClockComponent<T extends PIXI.DisplayObject>(type: new (...args: any) => T, x: number, y: number, key?: string | Phaser.RenderTexture): T
    {
        this.clockObject.classType = type
        const output = this.clockObject.create(x, y, key)
        this.clockObject.classType = Phaser.Sprite
        return output
    }

    handleScale()
    {
        this.clockObject.scale.set(this.referenceLength / ReferenceLength)
        this.clockObject.position.set(this.game.world.centerX, this.game.world.centerY)
    }

    updateClock()
    {
        const dateTime = new Date()
        this.timeStamp.text = dateTime.toLocaleString('en-GB', { hour12: false })
        this.hourHand.angle = hourToAngle(dateTime.getHours() + (dateTime.getMinutes() * 60 + dateTime.getSeconds()) / 3600)
        this.minuteHand.angle = minuteOrSecondToAngle(dateTime.getMinutes() + dateTime.getSeconds() / 60)
        this.add.tween(this.secondHand).to({ angle: minuteOrSecondToAngle(dateTime.getSeconds()) }, 200, Phaser.Easing.Bounce.Out, true)
    }

    update()
    {
        const widthHeight = getMinGameWidthOrHeight()
        if (this.referenceLength !== widthHeight)
        {
            this.referenceLength = widthHeight
            this.handleScale()
        }
    }
}