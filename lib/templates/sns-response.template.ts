/**
 * we don't want to send all of the information from SQS back to the callee
 * so we extract the key pieces of information needed to track the message.
 */
export const snsResponseTemplate: string = `
    #set($inputRoot = $input.path('$'))
    #set($sndMsgResp = $inputRoot.SendMessageResponse)
    #set($metadata = $sndMsgResp.ResponseMetadata)
    #set($sndMsgRes = $sndMsgResp.SendMessageResult)
    {
        "input" = "$input",
        "inputRoot" = "$inputRoot",
        "sndMsgResp" = "$sndMsgResp",
        "metadata" = "$metadata",
        "sndMsgRes" = "$sndMsgRes",
        "RequestId" : "$metadata.RequestId",
        "MessageId" : "$sndMsgRes.MessageId"
    }
`;
