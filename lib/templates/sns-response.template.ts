/**
 * we don't want to send all of the information from SQS back to the callee
 * so we extract the key pieces of information needed to track the message.
 */
export const snsResponseTemplate: string = `
    #set($inputRoot = $input.path('$'))
    #set($publishResponse = $inputRoot.PublishResponse)
    #set($publishResult = $publishResponse.PublishResult)
    #set($metadata = $publishResponse.ResponseMetadata)
    {
        "RequestId" : "$metadata.RequestId",
        "MessageId" : "$publishResult.MessageId",
        "Note": "Nathan will be so pleased to get another email message!",
    }
`;
