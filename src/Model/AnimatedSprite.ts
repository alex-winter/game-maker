export type Animation = {
    fps: number
    frameSrcs: string[]
}

export type BasicPlayer = {
    states: {
        walkingUp: Animation
        walkingDown: Animation
        walkingLeft: Animation
        walkingRight: Animation

        idleUp: Animation
        idleDown: Animation
        idleLeft: Animation
        idleRight: Animation
    }
}