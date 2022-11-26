import { useEffect, useRef, useState } from 'react';
import { Group, Stack, Text, Image, Progress, Button } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { createWorker } from 'tesseract.js';
import Head from 'next/head'


const Home = () => {
  const [imageData, setImageData] = useState<null | string>(null);
  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      setImageData(imageDataUri as string);
    };
    reader.readAsDataURL(file);
  };

  // const 

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('idle');
  const [ocrResult, setOcrResult] = useState('');

  const workerRef = useRef<Tesseract.Worker | null>(null);
  useEffect(() => {
    workerRef.current = createWorker({
      logger: message => {
        if ('progress' in message) {
          setProgress(message.progress);
          setProgressLabel(message.progress == 1 ? 'Done' : message.status);
        }
      }
    });
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    }
  }, []);

  const handleExtract = async () => {
    
    setProgress(0);
    setProgressLabel('starting');

    const worker = workerRef.current!;
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const response = await worker.recognize(imageData!);
    setOcrResult(response.data.text);
    console.log(response.data);
  };

  const handleGoogleSearch =  (engine:string) => {
    return () => {
      let win1 = window.open("//" + `${engine}.com/search?q=` + ocrResult, '_blank', 'location=yes,scrollbars=yes,status=yes');
    }
    
  }



  return (<>
    <Head>
      <title>Handwriting search</title>
      <script src="https://kit.fontawesome.com/90b34a1942.js" crossOrigin="anonymous"></script>

    </Head>
    <Group align='initial' style={{ padding: '10px' }}>
      <Stack style={{ flex: '1' }}>
        <Dropzone
          onDrop={(files) => loadFile(files[0])}
          accept={IMAGE_MIME_TYPE}
          multiple={false}
        >{() => (
          <Text size="xl" inline>
            Draw on canvas or Drag image here
          </Text>
        )}</Dropzone>

        {!!imageData && <Image src={imageData} style={{ width: '100%' }} />}

      </Stack>

      <Stack style={{ flex: '1' }}>
        <Button disabled={!imageData || !workerRef.current} onClick={handleExtract}>Extract</Button>
        <Text>{progressLabel.toUpperCase()}</Text>
        <Progress value={progress * 100} />

        {!!ocrResult && <Stack>
          <Text size='xl'>OCR RESULT</Text>
          <Text style={{ fontFamily: 'monospace', background: 'black', padding: '10px' }}>{ocrResult}</Text>

        </Stack>}

        <Stack>
          <Text size='xl'>Search on:</Text>
          <Button disabled={!ocrResult} onClick={handleGoogleSearch('google')}><i className="fa-brands fa-google" style={{margin: "10px"}}></i>Google</Button>
          <Button disabled={!ocrResult} onClick={handleGoogleSearch('bing')}><i className="fa-brands fa-microsoft" style={{margin: "10px"}}></i>Bing</Button>
          <Button disabled={!ocrResult} onClick={handleGoogleSearch('yahoo')}><i className="fa-brands fa-yahoo" style={{margin: "10px"}}></i> Yahoo</Button>


        </Stack>

      </Stack>
    </Group>

  </>);
}

export default Home;