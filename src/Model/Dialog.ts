export type Replies = {
    
    uuid: string
    
    text: string
    
    requiredSkillUuid: string | null
    
    requiredSkillLevel: number | null

    resultingDialogUuid: string | null

    endsConversation: boolean

    endConversationTriggerEventUuid: string | null
}

export type Dialog = {

    parentStageUuid: string | null

    uuid: string

    text: string

    replyUuids: string[]

    endsConversation: boolean

    endConversationTriggerEventUuid: string | null
}