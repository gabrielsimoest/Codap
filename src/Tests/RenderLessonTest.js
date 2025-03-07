import { useState } from 'react';
import { View } from 'react-native';
import { Modal } from 'react-native-paper';
import TheoryView from '../components/Shared/TheoryView'
import OpButton from '../components/Shared/OpButton';

export default function RenderLessonTest({ classTitle, lesson }) {

    const [visible, setVisible] = useState(false)

    return (
        <>
            <OpButton theme={'classButton'} title={classTitle} onPressFunction={() => setVisible(true)} />
            <Modal visible={visible}>
                <TheoryView
                    mainText={lesson[0]}
                    secondText={lesson[1]}
                    thirdText={lesson[2]}
                    endText={lesson[3]}
                />
            </Modal>
        </>
    );
}