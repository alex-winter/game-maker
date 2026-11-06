import test from 'node:test'
import assert from 'node:assert/strict'
import { startLoop } from './loop'

/** A scheduler the test advances by hand. */
function manualScheduler() {
    const queue: Array<(now: number) => void> = []

    return {
        schedule: (callback: (now: number) => void) => {
            queue.push(callback)
        },
        fire(now: number): void {
            const pending = queue.splice(0)

            for (const callback of pending) {
                callback(now)
            }
        },
        get pending(): number {
            return queue.length
        },
    }
}

test('the first frame has no elapsed time and later frames get the gap in seconds', () => {
    const scheduler = manualScheduler()
    const deltas: number[] = []

    startLoop(delta => deltas.push(delta), scheduler.schedule)

    scheduler.fire(1000)
    scheduler.fire(1016)
    scheduler.fire(1049)

    assert.deepEqual(deltas, [0, 0.016, 0.033])
})

test('a long gap is clamped to a tenth of a second', () => {
    const scheduler = manualScheduler()
    const deltas: number[] = []

    startLoop(delta => deltas.push(delta), scheduler.schedule)

    scheduler.fire(0)
    scheduler.fire(5000)

    assert.deepEqual(deltas, [0, 0.1])
})

test('stopping prevents further frames', () => {
    const scheduler = manualScheduler()
    let frames = 0

    const stop = startLoop(() => frames++, scheduler.schedule)

    scheduler.fire(0)
    stop()
    scheduler.fire(16)
    scheduler.fire(32)

    assert.equal(frames, 1)
    assert.equal(scheduler.pending, 0)
})
