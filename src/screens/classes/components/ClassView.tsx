import { Button, Text } from "react-native";
import { Classes } from "../../../types/entities";
import { Modal, Portal } from "react-native-paper";
import { useState } from "react";
import ThemedView from "../../../components/themed/ThemedView";
import ClassButton from "./ClassButton";
import TheoryView from "./TheoryLesson";

interface Props {
	classes: Classes[];
	title: string;
}

export default function ClassView({ classes, title }: Props) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Portal>
				<Modal
					visible={visible}
					onDismiss={() => setVisible(false)}
					contentContainerStyle={{ flex: 1 }}
					dismissableBackButton={true}
					dismissable={false}
				>
					{/* <ThemedView style={{ flex: 1 }}>
						<Text>{classes[0].lesson[0]}</Text>
					</ThemedView> */}
					<TheoryView
						firstParagraph="Teste"
						secondParagraph=""
						thirdParagraph=""
						endParagraph=""
						highlight={[""]}
						codeLanguage="HTML"
						code={`<!DOCTYPE html>
  <html>
    	<head>
      		<title>Minha página</title>
    	</head>
    	<body>
      		<h1>Minha página</h1>
      		<p>Esta é a minha primeira página HTML!</p>
    	</body>
  </html>`}
						progress={"50%"}
					/>
				</Modal>
			</Portal>
			<ClassButton title={title} onPress={() => setVisible(true)} />
		</>
	);
}
