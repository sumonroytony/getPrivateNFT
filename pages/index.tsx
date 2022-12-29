import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useProvider, useSigner } from 'wagmi';
import MarketFactoryContract from '../contact';
import { useContract } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import axios from 'axios';
import PrivateNFTModal from '../components/PrivateNFTModal';
const Type_Image = 1;
const Type_Audio = 2;
const Type_Video = 3;
const Type_PDF = 4;
const Type_Text = 5;
const Type_Import = 6;
const Type_Zip = 7;
const Type_Video_Import = 8;

interface PrivateURL {
  url: string;
  type: number;
}

export default function Home() {
  const { address, isConnected } = useAccount(undefined);
  const [collectionID, setCollectionID] = useState('');
  const [privateURL, setPrivateURL] = useState<PrivateURL | null>(null);
  const [openNFTModal, setOpenNFTModal] = useState(false);
  const provider = useProvider();
  const signer = new ethers.Wallet(
    process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
    provider
  );
  const marketFactoryContract1 = useContract({
    address: MarketFactoryContract.address,
    abi: MarketFactoryContract.abi,
    signerOrProvider: provider,
  });
  const marketFactoryContract2 = useContract({
    address: MarketFactoryContract.address,
    abi: MarketFactoryContract.abi,
    signerOrProvider: signer,
  });

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const generateURL = (base64String: string, type: string) => {
    const blob = b64toBlob(base64String, type);
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const onDecryptFile = async () => {
    setPrivateURL(null);
    let loadingToast = toast.loading("Let's check your permission...");

    try {
      const hasPermission =
        await marketFactoryContract1?.hasPermissionPrivateMetadata(
          collectionID,
          address
        );
      toast.dismiss(loadingToast);
      if (hasPermission) toast.success('You have permission to decrypt!');
      else {
        toast.error('You do not have permission to decrypt!');
        return;
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong!');
      return;
    }

    try {
      const loadingMetadata = toast.loading('Retrieving metadata...');
      let metadata = await marketFactoryContract2?.viewPrivateMetadata(
        collectionID,
        address
      );
      toast.dismiss(loadingMetadata);
      toast.success('Metadata retrieved!');
      const isValid = metadata.isValid;
      if (!isValid) {
        toast.error('Invalid File');
        return;
      }
      const url = metadata.metadata.replace(
        'ipfs://',
        'https://nftstorage.link/ipfs/'
      );
      const isEncrypt = metadata.isEncrypt;
      const loadingGettingData = toast.loading(
        'Getting data from NFT Storage...'
      );
      let nftStorageData = await axios.get(url);
      toast.dismiss(loadingGettingData);
      toast.success('Data retrieved!');
      const loadingDecrypting = toast.loading('Decrypting...');
      let data: any = window.atob(nftStorageData.data);
      data = JSON.parse(data);
      if (isEncrypt) {
        const decryptedData = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/decrypt`,
          { data: data.content }
        );
        const type = data.extention;
        let tmpURL;
        if (type.split('/')[0] === 'audio') {
          tmpURL = generateURL(decryptedData.data, type);
          setPrivateURL({ url: tmpURL, type: Type_Audio });
        } else if (type === 'application/pdf') {
          tmpURL = generateURL(decryptedData.data, type);
          setPrivateURL({ url: tmpURL, type: Type_PDF });
        } else if (type === 'application/x-zip-compressed') {
          tmpURL = generateURL(decryptedData.data, type);
          console.log(tmpURL);
          setPrivateURL({ url: tmpURL, type: Type_Zip });
        } else if (type.split('/')[0] === 'video') {
          tmpURL = generateURL(decryptedData.data, type);
          setPrivateURL({ url: tmpURL, type: Type_Video });
        } else if (type.split('/')[0] === 'text') {
          tmpURL = generateURL(decryptedData.data, type);
          setPrivateURL({ url: tmpURL, type: Type_Text });
        } else if (type.split('/')[0] === 'image') {
          tmpURL = generateURL(decryptedData.data, type);
          setPrivateURL({ url: tmpURL, type: Type_Image });
        }
      } else {
        const _ty = data.extention.split('/')[1];
        console.log('------------pr-------', data);
        if (_ty === 'video') {
          setPrivateURL({ url: data.content, type: Type_Video_Import });
        } else if (_ty === 'music') {
          setPrivateURL({ url: data.content, type: Type_Audio });
        } else if (_ty === 'image') {
          setPrivateURL({ url: data.content, type: Type_Image });
        } else if (_ty === 'ebook') {
          setPrivateURL({ url: data.content, type: Type_PDF });
        } else if (_ty === 'ipfs') {
          const metadata = await axios.get(data.content);
          setPrivateURL({ url: metadata.data.image, type: Type_Image });
        }
      }
      toast.dismiss(loadingDecrypting);
      toast.success('Decrypted!');
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong!');
    }
  };

  return (
    <>
      <div className='bg-black text-white grid h-screen place-items-center '>
        <div className='flex items-center content-center flex-col border-2 p-10 rounded border-white shadow-slate-50 shadow-md sha'>
          {!address && (
            <h6 className='text-3xl mb-3'>Please Connect Your Wallet!</h6>
          )}
          <ConnectButton />
          {address && (
            <>
              <div className='m-4 flex items-center content-center flex-col'>
                <label
                  htmlFor='collection_id'
                  className='block text-sm font-medium text-white'
                >
                  Collection ID
                </label>
                <div className='mt-1'>
                  <input
                    value={collectionID}
                    onChange={(e) => setCollectionID(e.target.value)}
                    type='text'
                    name='collection_id'
                    id='collection_id'
                    placeholder='Enter your collection ID'
                    className='block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                </div>
                <button
                  onClick={onDecryptFile}
                  disabled={!collectionID}
                  type='button'
                  className='mt-10 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                >
                  Let&apos;s Decrypt
                </button>

                {privateURL && (
                  <button
                    onClick={() => setOpenNFTModal(true)}
                    type='button'
                    className='mt-10 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  >
                    Show My NFT
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <PrivateNFTModal
        openNFTModal={openNFTModal}
        setOpenNFTModal={setOpenNFTModal}
        privateURL={privateURL}
      />
    </>
  );
}
