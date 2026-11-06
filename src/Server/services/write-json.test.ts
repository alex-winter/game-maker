import test from 'node:test'
import assert from 'node:assert/strict'
import { AtomicWriteFs, temporaryPathFor, writeAtomically } from './write-json'

type FakeDisk = {
    readonly files: Map<string, string>

    readonly io: AtomicWriteFs
}

function fakeDisk(failWrite = false): FakeDisk {
    const files = new Map<string, string>([['data/project.json', '{"old":true}']])

    return {
        files,
        io: {
            write: (path, content) => {
                if (failWrite) {
                    throw new Error('disk full')
                }
                files.set(path, content)
            },
            rename: (from, to) => {
                const content = files.get(from)

                if (content === undefined) {
                    throw new Error('missing ' + from)
                }

                files.delete(from)
                files.set(to, content)
            },
            remove: path => {
                files.delete(path)
            },
        },
    }
}

test('a successful write replaces the target and leaves no temp file', () => {
    const disk = fakeDisk()

    writeAtomically('data/project.json', '{"new":true}', disk.io)

    assert.equal(disk.files.get('data/project.json'), '{"new":true}')
    assert.equal(disk.files.has(temporaryPathFor('data/project.json')), false)
})

test('a write that throws leaves the original file and no temp file', () => {
    const disk = fakeDisk(true)

    assert.throws(
        () => writeAtomically('data/project.json', '{"new":true}', disk.io),
        /disk full/,
    )

    assert.equal(disk.files.get('data/project.json'), '{"old":true}')
    assert.equal(disk.files.has(temporaryPathFor('data/project.json')), false)
})

test('the temporary file is a sibling in the same directory', () => {
    assert.equal(temporaryPathFor('/a/b/project.json'), '/a/b/project.json.tmp')
})
