import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import type { S3Event } from "aws-lambda";

const client = new SQSClient({
    region: "",
    credentials: {
        accessKeyId: "",
        secretAccessKey: ""
    }
});

async function init() {
    const command = new ReceiveMessageCommand({
        QueueUrl: "",
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
    });

    while(true) {
        const { Messages } = await client.send(command);
        if(!Messages) {
            console.log("No message in queue");
            continue;
        }

        try {
            for(const message of Messages) {
                const { MessageId, Body } = message;
                console.log(`Message received`, { MessageId, Body });
                // validate and parse the event 
                if(!Body) continue;
                const event = JSON.parse(Body) as S3Event;

                // ignore the s3 test event
                if("Service" in event && "Event" in event) {
                    if(event.Event === "s3:TestEvent") continue; 
                }
    
                for(const record of event.Records) {
                    const { s3 } = record;
                    const { bucket, object: { key } } = s3;
                    // spin the docker container
                }
    
    
                // delete the message from queue
                
            }
        } catch (error) {
            
        }

    }
}

init()