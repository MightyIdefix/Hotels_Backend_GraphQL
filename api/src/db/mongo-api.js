import mongoClient from './mongo-client';

const mongoApiWrapper = async () => {
  const { mdb } = await mongoClient();

  const mdbFindDocumentsByField = ({
    collectionName,
    fieldName,
    fieldValues,
  }) =>
    mdb
      .collection(collectionName)
      .find({ [fieldName]: { $in: fieldValues } })
      .toArray();

    return {
    detailLists: async (hotelname) => {
        const mongoDocuments = await mdbFindDocumentsByField({
        collectionName: 'hotels',
        fieldName: 'name',
        fieldValues: hotelname,
        });

        return hotelname.map((hotelname) => {
        const hotelDoc = mongoDocuments.find(
            (doc) => hotelname === doc.name
        );

        if (!hotelDoc) {
            return [];
        }

        const { explanations, notes, warnings } = approachDoc;
        const approachDetails = [];
        if (explanations) {
          approachDetails.push(
            ...explanations.map((explanationText) => ({
              content: explanationText,
              category: 'EXPLANATION',
            }))
          );
        }
        return approachDetails;
      });
    },

    mutators: {},
  };
};
export default mongoApiWrapper;
