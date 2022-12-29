import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';
import Image from 'next/image';
import PDFLoader from './PDFLoader';

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
interface PrivateNFTModalProps {
  openNFTModal: boolean;
  setOpenNFTModal: (open: boolean) => void;
  privateURL: PrivateURL | null;
}

const PrivateNFTModal = ({
  openNFTModal,
  setOpenNFTModal,
  privateURL,
}: PrivateNFTModalProps) => {
  const [scale, setScale] = useState(1);
  return (
    <Transition.Root show={openNFTModal} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={setOpenNFTModal}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <div className='absolute top-0 right-0 hidden pt-4 pr-4 sm:block'>
                  <button
                    type='button'
                    className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    onClick={() => setOpenNFTModal(false)}
                  >
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg font-medium leading-6 text-gray-900'
                    >
                      Private NFT
                    </Dialog.Title>
                    <div className='mt-2'>
                      {(privateURL?.type === Type_Audio ||
                        privateURL?.type === Type_Video ||
                        privateURL?.type === Type_Import) && (
                        <ReactPlayer
                          config={{
                            file: {
                              attributes: { controlsList: 'nodownload' },
                            },
                          }}
                          onContextMenu={(e: any) => e.preventDefault()}
                          url={privateURL?.url}
                          controls
                          width='100%'
                        />
                      )}
                      {Type_Video_Import === privateURL?.type && (
                        <iframe
                          src={privateURL?.url}
                          width='640'
                          height='480'
                          allow='autoplay'
                        ></iframe>
                      )}
                      {privateURL?.type === Type_Image && (
                        <Image
                          src={privateURL?.url}
                          height={600}
                          width={600}
                          alt='private Image'
                        />
                      )}
                      {privateURL?.type === Type_Zip && (
                        <a href={privateURL?.url}>Download</a>
                      )}
                      {privateURL?.type === Type_PDF && (
                        <div className='flex flex-col gap-4'>
                          <div className='h-full max-h-[500px] overflow-auto'>
                            <PDFLoader pdf={privateURL?.url} zoom={scale} />
                          </div>
                          <div className='flex'>
                            <button
                              className='mt-10 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                              onClick={() => {
                                if (scale > 2) return;
                                setScale(scale + 0.1);
                              }}
                            >
                              +
                            </button>
                            <button
                              className='mt-10 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                              onClick={() => {
                                if (scale < 0.5) return;
                                setScale(scale - 0.1);
                              }}
                            >
                              {' '}
                              -{' '}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default PrivateNFTModal;
