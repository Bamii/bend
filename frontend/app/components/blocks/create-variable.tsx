import useBend from "~/hooks/useBend"

export default function CreateVariableBlock() {
    const { bend } = useBend();

    const creator = () => {
        // bend.create_block("")
    }

    return (
        <div onClick={creator}>
            create variable
        </div>
    )
}